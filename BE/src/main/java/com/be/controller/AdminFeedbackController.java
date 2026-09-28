package com.be.controller;

import com.be.dto.response.ApiResponse;
import com.be.dto.response.FeedBackResponse;
import com.be.service.FeedBackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/feedbacks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Feedback Management", description = "Quản lý và kiểm duyệt đánh giá tour/buddy của khách hàng")
public class AdminFeedbackController {

    private final FeedBackService feedBackService;

    @GetMapping
    @Operation(summary = "Lấy danh sách đánh giá (phân trang, lọc theo điểm tourRating, buddyRating, tìm kiếm nội dung)")
    public ResponseEntity<ApiResponse<Page<FeedBackResponse>>> getFeedbacks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer tourRating,
            @RequestParam(required = false) Integer buddyRating,
            @ParameterObject @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<FeedBackResponse> responses = feedBackService.getAdminFeedbacks(keyword, tourRating, buddyRating, pageable);
        return ResponseEntity.ok(ApiResponse.success("Get feedbacks successfully", responses));
    }

    @GetMapping("/{feedbackId}")
    @Operation(summary = "Xem chi tiết một đánh giá")
    public ResponseEntity<ApiResponse<FeedBackResponse>> getFeedbackDetail(@PathVariable UUID feedbackId) {
        FeedBackResponse response = feedBackService.getFeedbackDetail(feedbackId);
        return ResponseEntity.ok(ApiResponse.success("Get feedback detail successfully", response));
    }

    @DeleteMapping("/{feedbackId}")
    @Operation(summary = "Xóa đánh giá vi phạm tiêu chuẩn cộng đồng")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable UUID feedbackId) {
        feedBackService.deleteFeedback(feedbackId);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted successfully", null));
    }
}