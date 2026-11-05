package com.be.service.impl;

import com.be.entity.Activity;
import com.be.entity.ItineraryStop;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.repository.ActivityRepository;
import com.be.service.ActivityTranslationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

@Service
@Slf4j
public class ActivityTranslationServiceImpl implements ActivityTranslationService {
    private static final int MAX_FIELDS_PER_CALL = 8;
    private static final int MAX_SOURCE_CHARACTERS = 12000;
    private final ActivityRepository activities;
    private final GeminiMatchingClient gemini;
    private final Executor executor;
    private final TransactionTemplate reads;
    private final TransactionTemplate writes;
    private final AtomicBoolean backfillQueued = new AtomicBoolean();

    public ActivityTranslationServiceImpl(ActivityRepository activities, GeminiMatchingClient gemini,
            @Qualifier("activityTranslationExecutor") Executor executor, PlatformTransactionManager transactions) {
        this.activities = activities;
        this.gemini = gemini;
        this.executor = executor;
        reads = new TransactionTemplate(transactions);
        reads.setReadOnly(true);
        reads.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        writes = new TransactionTemplate(transactions);
        writes.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    public void schedule(UUID activityId) {
        if (activityId == null || !gemini.configured()) return;
        Runnable queue = () -> {
            try {
                executor.execute(() -> translate(activityId));
            } catch (RuntimeException e) {
                // Translation must never roll back an already saved tour.
                log.warn("Could not queue English tour content: activityId={}, errorType={}", activityId, e.getClass().getSimpleName());
            }
        };
        if (TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() { queue.run(); }
            });
        } else queue.run();
    }

    @Override
    public int scheduleMissing() {
        if (!gemini.configured()) throw new AppException(ErrorCode.AI_NOT_CONFIGURED);
        if (!backfillQueued.compareAndSet(false, true)) return 0;
        try {
            List<UUID> ids = reads.execute(status -> activities.findTranslationCandidateIds());
            if (ids == null || ids.isEmpty()) {
                backfillQueued.set(false);
                return 0;
            }
            executor.execute(() -> {
                try {
                    for (UUID id : ids) {
                        if (Thread.currentThread().isInterrupted()) break;
                        if (!translate(id)) break;
                    }
                } finally { backfillQueued.set(false); }
            });
            return ids.size();
        } catch (RuntimeException e) {
            backfillQueued.set(false);
            throw e;
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void translateExistingContentOnStartup() {
        if (!gemini.configured()) return;
        try {
            int queued = scheduleMissing();
            log.info("Queued missing English content for {} tours", queued);
        } catch (RuntimeException e) {
            log.warn("Could not queue existing English content: errorType={}", e.getClass().getSimpleName());
        }
    }

    private boolean translate(UUID activityId) {
        try {
            Map<String, TextField> fields = reads.execute(status -> activities.findById(activityId)
                    .map(ActivityTranslationServiceImpl::fields).orElseGet(Map::of));
            if (fields == null) return true;
            List<Map.Entry<String, TextField>> missing = fields.entrySet().stream()
                    .filter(entry -> entry.getValue().missing()).toList();
            for (Map<String, TextField> batch : batches(missing)) {
                if (Thread.currentThread().isInterrupted()) return false;
                Map<String, String> source = new LinkedHashMap<>();
                batch.forEach((key, field) -> source.put(key, field.source()));
                // No database transaction or row lock is held while waiting for Gemini.
                Map<String, String> translations = gemini.translateFieldsToEnglish(source);
                if (translations == null || !translations.keySet().equals(batch.keySet()))
                    throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
                for (var entry : batch.entrySet()) {
                    String english = translations.get(entry.getKey());
                    if (english == null || english.isBlank() || english.length() > entry.getValue().maxLength())
                        throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
                }
                writes.executeWithoutResult(status -> activities.findByIdWithLock(activityId).ifPresent(activity -> {
                    Map<String, TextField> current = fields(activity);
                    batch.forEach((key, old) -> {
                        TextField now = current.get(key);
                        if (now != null && now.missing() && Objects.equals(old.source(), now.source()))
                            now.setter().accept(translations.get(key).strip());
                    });
                    activities.flush();
                }));
            }
            return true;
        } catch (RuntimeException e) {
            log.warn("English tour content translation incomplete: activityId={}, errorType={}", activityId, e.getClass().getSimpleName());
            // Stop a bulk scan during provider outages instead of sending another request for every tour.
            return !(e instanceof AppException app && (app.getErrorCode() == ErrorCode.AI_UNAVAILABLE
                    || app.getErrorCode() == ErrorCode.AI_RATE_LIMITED || app.getErrorCode() == ErrorCode.AI_NOT_CONFIGURED));
        }
    }

    private static List<Map<String, TextField>> batches(List<Map.Entry<String, TextField>> missing) {
        List<Map<String, TextField>> batches = new ArrayList<>();
        Map<String, TextField> batch = new LinkedHashMap<>();
        int characters = 0;
        for (var entry : missing) {
            if (!batch.isEmpty() && (batch.size() >= MAX_FIELDS_PER_CALL
                    || characters + entry.getValue().source().length() > MAX_SOURCE_CHARACTERS)) {
                batches.add(batch);
                batch = new LinkedHashMap<>();
                characters = 0;
            }
            batch.put(entry.getKey(), entry.getValue());
            characters += entry.getValue().source().length();
        }
        if (!batch.isEmpty()) batches.add(batch);
        return batches;
    }

    private static Map<String, TextField> fields(Activity activity) {
        Map<String, TextField> result = new LinkedHashMap<>();
        result.put("title", new TextField(activity.getTitle(), activity.getTitleEn(), 400, activity::setTitleEn));
        result.put("description", new TextField(activity.getDescription(), activity.getDescriptionEn(), Integer.MAX_VALUE, activity::setDescriptionEn));
        result.put("locationName", new TextField(activity.getLocationName(), activity.getLocationNameEn(), 500, activity::setLocationNameEn));
        result.put("address", new TextField(activity.getAddress(), activity.getAddressEn(), 1000, activity::setAddressEn));
        for (ItineraryStop stop : activity.getItineraryStops()) {
            if (stop.getStopId() == null) continue;
            String prefix = "stop_" + stop.getStopId() + "_";
            result.put(prefix + "title", new TextField(stop.getTitle(), stop.getTitleEn(), 400, stop::setTitleEn));
            result.put(prefix + "description", new TextField(stop.getDescription(), stop.getDescriptionEn(), 2000, stop::setDescriptionEn));
        }
        return result;
    }

    private record TextField(String source, String english, int maxLength, Consumer<String> setter) {
        boolean missing() { return source != null && !source.isBlank() && (english == null || english.isBlank()); }
    }
}
