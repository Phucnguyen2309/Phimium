package com.be.scheduler;

import com.be.service.impl.StatusSchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActivityScheduler {

    private final StatusSchedulerService statusSchedulerService;

    @Scheduled(fixedRate = 60000)
    public void updateStatusToOngoing() {
        statusSchedulerService.updateActivityAndGroupStatus();
    }
}
