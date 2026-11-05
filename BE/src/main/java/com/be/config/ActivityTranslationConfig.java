package com.be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class ActivityTranslationConfig {
    @Bean
    public ThreadPoolTaskExecutor activityTranslationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("activity-translation-");
        executor.setWaitForTasksToCompleteOnShutdown(false);
        return executor;
    }
}
