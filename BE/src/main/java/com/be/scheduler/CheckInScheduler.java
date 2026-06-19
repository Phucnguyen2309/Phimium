package com.be.scheduler;

import com.be.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CheckInScheduler {

    private final RegistrationService registrationService;

    @Scheduled(fixedRate = 60000)
    public void autoMarkAbsent() {
        registrationService.autoMarkAbsentAfterActivityEndTime();
    }
}
