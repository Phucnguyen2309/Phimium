package com.be.exception;

import com.be.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(
            AppException exception,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = exception.getErrorCode();

        ApiResponse<?> response = ApiResponse.builder()
                .success(false)
                .code(errorCode.getCode())
                .message(exception.getMessage())
                .build();

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(response);
    }
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(
            Exception exception,
            HttpServletRequest request
    ) {
        ApiResponse<?> response = ApiResponse.builder()
                .success(false)
                .code(ErrorCode.USER_NOT_AUTHORIZED.getCode())
                .message(ErrorCode.USER_NOT_AUTHORIZED.getMessage())
                .build();

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        ));

        return ResponseEntity.badRequest()
                .body(
                        ApiResponse.builder()
                                .success(false)
                                .code(ErrorCode.VALIDATION_ERROR.getCode())
                                .message("Validation failed")
                                .data(errors)
                                .build()
                );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleConstraintViolationException(
            ConstraintViolationException exception
    ) {
        Map<String, String> errors = new HashMap<>();

        exception.getConstraintViolations()
                .forEach(violation ->
                        errors.put(
                                violation.getPropertyPath().toString(),
                                violation.getMessage()
                        ));

        return ResponseEntity.badRequest()
                .body(
                        ApiResponse.builder()
                                .success(false)
                                .code(ErrorCode.VALIDATION_ERROR.getCode())
                                .message("Validation failed")
                                .data(errors)
                                .build()
                );
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ApiResponse<?>> handleTransactionSystemException(
            TransactionSystemException exception
    ) {
        Throwable cause = exception.getRootCause();
        if (cause instanceof ConstraintViolationException constraintViolationException) {
            return handleConstraintViolationException(constraintViolationException);
        }

        return ResponseEntity
                .internalServerError()
                .body(
                        ApiResponse.builder()
                                .success(false)
                                .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                                .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                                .build()
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnknownException(
            Exception exception,
            HttpServletRequest request
    ) {
        ApiResponse<?> response = ApiResponse.builder()
                .success(false)
                .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                .build();

        return ResponseEntity
                .internalServerError()
                .body(response);
    }

}
