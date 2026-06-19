package com.be.controller;

import com.be.dto.request.InstructionRequest;
import com.be.dto.response.GlobalGuidelineResponse;
import com.be.service.impl.GuidelineServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activities/{activityId}/guidelines")
@RequiredArgsConstructor
public class GuidelineController {

    private final GuidelineServiceImpl guidelineService;

    // Lấy ra để User đọc
    @GetMapping
    public ResponseEntity<GlobalGuidelineResponse> getGuideline(@PathVariable UUID activityId) {
        return ResponseEntity.ok(guidelineService.getGuidelineByActivity(activityId));
    }

    // Host TẠO MỚI Instruction (Chỉ gọi 1 lần đầu)
    @PostMapping
    public ResponseEntity<GlobalGuidelineResponse> createInstruction(
            @PathVariable UUID activityId,
            @Valid @RequestBody InstructionRequest request) {
        return ResponseEntity.ok(guidelineService.createInstruction(activityId, request));
    }

    // Host CẬP NHẬT Instruction (Gọi khi muốn sửa đổi)
    @PutMapping
    public ResponseEntity<GlobalGuidelineResponse> updateInstruction(
            @PathVariable UUID activityId,
            @Valid @RequestBody InstructionRequest request) {
        return ResponseEntity.ok(guidelineService.updateInstruction(activityId, request));
    }
}