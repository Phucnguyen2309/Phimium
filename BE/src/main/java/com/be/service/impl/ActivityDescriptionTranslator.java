package com.be.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Dịch mô tả tour sang tiếng Anh bằng Gemini (dùng chung cấu hình AI Matchmaker).
 * Không bao giờ làm hỏng việc lưu tour: AI chưa cấu hình hoặc lỗi thì trả null,
 * FE sẽ hiển thị bản tiếng Việt.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityDescriptionTranslator {
    private final GeminiMatchingClient gemini;

    public String toEnglish(String vietnamese) {
        if (vietnamese == null || vietnamese.isBlank() || !gemini.configured()) return null;
        try {
            return gemini.translateToEnglish(vietnamese.trim());
        } catch (Exception e) {
            log.warn("Translate activity description failed: {}", e.getClass().getSimpleName());
            return null;
        }
    }
}
