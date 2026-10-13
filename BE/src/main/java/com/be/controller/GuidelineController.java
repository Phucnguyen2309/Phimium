package com.be.controller;

import com.be.dto.request.InstructionRequest;
import com.be.dto.response.GlobalGuidelineResponse;
import com.be.service.GuidelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activities/{activityId}/guidelines")
@RequiredArgsConstructor
public class GuidelineController {

    private final GuidelineService guidelineService;

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
