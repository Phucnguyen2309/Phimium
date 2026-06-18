package com.be.dto.response;

import com.be.util.DateTimeUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    private boolean success;

    private int code;

    private String message;

    private T data;

    @Builder.Default
    private LocalDateTime timestamp = DateTimeUtils.nowVietnam();

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(0)
                .message(message)
                .data(data)
                .build();
    }
}
