package com.be.service;

import java.util.UUID;

public interface ActivityTranslationService {
    /** Queues a tour after its enclosing transaction commits. */
    void schedule(UUID activityId);

    /** Queues missing translations for existing tours and itinerary stops; returns candidate tour count. */
    int scheduleMissing();
}
