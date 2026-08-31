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
            "Incorrect username or password"
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
    INVALID_GUEST_COUNT(
            3007,
            HttpStatus.BAD_REQUEST,
            "Must have at least 1 guest"
    ),
    INVALID_REGISTRATION_STATUS(
            3008,
            HttpStatus.BAD_REQUEST,
            "Registration status is not valid for this operation"
    ),
    AT_LEAST_ONE_ADULT_REQUIRED(
            3009,
            HttpStatus.BAD_REQUEST,
            "At least one adult (>= 1) is required to book a tour"
    ),
// ================= COUPON (4500 - 4599) =================

    COUPON_NOT_FOUND(
            4501,
            HttpStatus.NOT_FOUND,
            "Coupon code not found"
    ),

    COUPON_INACTIVE(
            4502,
            HttpStatus.BAD_REQUEST,
            "Coupon is currently inactive"
    ),

    COUPON_EXPIRED(
            4503,
            HttpStatus.BAD_REQUEST,
            "Coupon has expired or is not yet valid"
    ),

    COUPON_USAGE_LIMIT_REACHED(
            4504,
            HttpStatus.BAD_REQUEST,
            "Coupon usage limit has been reached"
    ),

    COUPON_MINIMUM_NOT_MET(
            4505,
            HttpStatus.BAD_REQUEST,
            "Order subtotal does not meet the minimum amount required for this coupon"
    ),
    COUPON_NOT_APPLICABLE(
            4506,
            HttpStatus.BAD_REQUEST,
            "The provided coupon cannot be applied to this booking"
    ),
    // ================= ACTIVITY & DEPARTURE (5000 - 5999) =================

    ACTIVITY_NOT_FOUND(
            5001,
            HttpStatus.NOT_FOUND,
            "Activity not found"
    ),

    DEPARTURE_NOT_FOUND(
            5002,
            HttpStatus.NOT_FOUND,
            "Activity departure not found"
    ),

    DEPARTURE_NOT_AVAILABLE(
            5003,
            HttpStatus.CONFLICT,
            "Activity departure is closed or cancelled"
    ),

    DEPARTURE_IN_PAST(
            5004,
            HttpStatus.BAD_REQUEST,
            "Cannot register for a past departure"
    ),

    INSUFFICIENT_CAPACITY(
            5005,
            HttpStatus.CONFLICT,
            "Insufficient departure capacity"
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
    BUDDY_SCHEDULE_CONFLICT(
            4004,
            HttpStatus.CONFLICT,
            "Buddy has a schedule conflict with this tour"
    ),
    // ================= GUIDELINE (6000 - 6999) =================
    GUIDELINE_NOT_FOUND(
            6001,
            HttpStatus.NOT_FOUND,
            "Guideline not found for this activity"
    ),

    GUIDELINE_ALREADY_EXISTS(
            6002,
            HttpStatus.CONFLICT,
            "Guideline already exists for this activity. Please use update instead"
    ),

    FEEDBACK_ALREADY_EXISTS(
            7001,
            HttpStatus.CONFLICT,
            "Feedback has already been submitted for this registration"
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
