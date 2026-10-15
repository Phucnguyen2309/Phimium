package com.be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class BookingEmailSchedulingConfig {
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        return scheduler("scheduled-");
    }

    @Bean
    public ThreadPoolTaskScheduler bookingEmailTaskScheduler() {
        return scheduler("booking-email-");
    }

    private ThreadPoolTaskScheduler scheduler(String prefix) {
        var scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix(prefix);
        return scheduler;
    }
}
