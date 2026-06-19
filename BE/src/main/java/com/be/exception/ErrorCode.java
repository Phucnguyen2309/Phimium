package com.be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

// ================= USER & AUTH (1000 - 1999) =================

    USER_NOT_FOUND(
            1001,
            HttpStatus.BAD_REQUEST,
            "Tên đăng nhập không tồn tại"
    ),
    USER_ID_NOT_FOUND(
            1005,
            HttpStatus.NOT_FOUND,
            "UserId không tồn tại"
    ),

    INVALID_CREDENTIALS(
            1002,
            HttpStatus.UNAUTHORIZED,
            "Tên đăng nhập hoặc mật khẩu sai"
    ),

    USER_NOT_AUTHORIZED(
            1003,
            HttpStatus.FORBIDDEN,
            "You are not authorized to perform this action"
    ),

    EMAIL_ALREADY_EXISTS(
            1004,
            HttpStatus.CONFLICT,
            "Email already exists"
    ),

    INVALID_TOKEN(
            1006,
            HttpStatus.UNAUTHORIZED,
            "Invalid token"
    ),

// ================= GROUP (2000 - 2999) =================

    GROUP_NOT_FOUND(
            2001,
            HttpStatus.NOT_FOUND,
            "Activity group not found"
    ),

    GROUP_ACTIVITY_MISMATCH(
            2002,
            HttpStatus.BAD_REQUEST,
            "Group does not belong to the registered activity"
    ),

    GROUP_IS_FULL(
            2003,
            HttpStatus.BAD_REQUEST,
            "Activity group is full"
    ),

// ================= REGISTRATION (3000 - 3999) =================

    REGISTRATION_NOT_FOUND(
            3001,
            HttpStatus.NOT_FOUND,
            "Registration not found"
    ),

    REGISTRATION_ALREADY_EXISTS(
            3002,
            HttpStatus.CONFLICT,
            "User has already registered for this activity"
    ),

    REGISTRATION_ALREADY_CANCELLED(
            3003,
            HttpStatus.BAD_REQUEST,
            "Registration has already been cancelled"
    ),

    REGISTRATION_CANNOT_BE_CANCELLED(
            3004,
            HttpStatus.BAD_REQUEST,
            "This registration cannot be cancelled"
    ),

    REGISTRATION_CANNOT_CHECK_IN(
            3005,
            HttpStatus.BAD_REQUEST,
            "Registration is not eligible for check-in"
    ),

    REGISTRATION_ALREADY_CHECKED_IN(
            3006,
            HttpStatus.CONFLICT,
            "Registration has already been checked in"
    ),

// ================= COMMON (9000 - 9999) =================

    VALIDATION_ERROR(
            9001,
            HttpStatus.BAD_REQUEST,
            "Validation failed"
    ),

    INTERNAL_SERVER_ERROR(
            9999,
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Internal server error"
    ),

    // ==================== Cloudinary ==============
    CLOUDINARY_ERROR(
            9999,
            HttpStatus.INTERNAL_SERVER_ERROR,
            "cloudinary error"
    ),
    // ========= BUDDY =====
    USER_ALREADY_BUDDY(
            4001,
            HttpStatus.CONFLICT,
            "User is already a Buddy"
    ),

    BUDDY_ALREADY_EXISTS(
            4002,
            HttpStatus.CONFLICT,
            "Buddy profile already exists"
    ), BUDDY_NOT_FOUND(
            4003,
            HttpStatus.NOT_FOUND,
            "Buddy not found"
    ),
    //==========ACTIVITY ===============
    ACTIVITY_NOT_FOUND(
            5001,
            HttpStatus.NOT_FOUND,
            "Activity not found"
    ),
    // ================= GUIDELINE (6000 - 6999) =================
    GUIDELINE_NOT_FOUND(
            6001,
            HttpStatus.NOT_FOUND,
            "Sự kiện này chưa có hướng dẫn tham gia"
    ),

    GUIDELINE_ALREADY_EXISTS(
            6002,
            HttpStatus.CONFLICT,
            "Sự kiện này đã có hướng dẫn tham gia, vui lòng dùng tính năng Cập nhật"
    ),
    FEEDBACK_ALREADY_EXISTS(
            7001,
            HttpStatus.NOT_FOUND,
            "Người dùng chỉ được feedback  1 lần  "
    ),
    CHECKIN_CLOSED(
            8001,
            HttpStatus.BAD_REQUEST,
        "Check-in is closed"
    ),

    CHECKIN_NOT_OPEN(
            8002,
            HttpStatus.BAD_REQUEST,
        "Check-in is not open yet"
    ),

    ALREADY_CHECKED_IN(
            8003,
            HttpStatus.CONFLICT,
        "User already checked in"
    )
    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(int code, HttpStatus httpStatus, String message) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }

}
