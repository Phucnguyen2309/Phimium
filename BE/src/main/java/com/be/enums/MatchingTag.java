package com.be.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MatchingTag {
    PHOTOGRAPHY("TOPIC", "Chụp ảnh", "Photography"),
    FOOD("TOPIC", "Ẩm thực", "Food"),
    HISTORY("TOPIC", "Lịch sử", "History"),
    ARCHITECTURE("TOPIC", "Kiến trúc", "Architecture"),
    LOCAL_CULTURE("TOPIC", "Văn hóa địa phương", "Local culture"),
    SNACKS("FOOD", "Ăn vặt", "Snacks"),
    STREET_FOOD("FOOD", "Ẩm thực đường phố", "Street food"),
    CHINESE_CUISINE("FOOD", "Món Hoa", "Chinese cuisine"),
    TRADITIONAL_FOOD("FOOD", "Món truyền thống", "Traditional food"),
    CAFE("FOOD", "Cà phê", "Cafes"),
    OLD_NEIGHBORHOODS("DISCOVERY", "Phố cổ", "Old neighborhoods"),
    HERITAGE("DISCOVERY", "Di sản", "Heritage"),
    HIDDEN_GEMS("DISCOVERY", "Địa điểm ít người biết", "Hidden gems"),
    RETRO("VIBE", "Hoài cổ", "Retro"),
    CHILL("VIBE", "Thư giãn", "Relaxed"),
    LIVELY("VIBE", "Sôi động", "Lively");

    private final String category;
    private final String labelVi;
    private final String labelEn;
}
