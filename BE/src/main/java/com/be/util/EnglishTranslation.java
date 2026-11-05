package com.be.util;

import java.util.Objects;

/** Preserves explicit translations and invalidates translations of changed source text. */
public final class EnglishTranslation {
    private EnglishTranslation() { }

    public static String resolve(String previousSource, String source, String currentEnglish, String providedEnglish) {
        if (providedEnglish != null && !providedEnglish.isBlank()) return providedEnglish.strip();
        if (source == null || source.isBlank() || !Objects.equals(previousSource, source)) return null;
        return currentEnglish == null || currentEnglish.isBlank() ? null : currentEnglish;
    }
}
