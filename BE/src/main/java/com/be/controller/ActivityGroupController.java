package com.be.controller;

import com.be.dto.request.ActivityGroupRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.dto.response.ApiResponse;
import com.be.service.ActivityGroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/group")
public class ActivityGroupController {
    @Autowired
    private ActivityGroupService activityGroupService;


    @PostMapping("/createGroup")
    public ResponseEntity<ApiResponse<ActivityGroupResponse>> createGroup(
            @Valid @RequestBody ActivityGroupRequest activityGroupRequest) {
        ActivityGroupResponse activityGroupResponse = activityGroupService.createActivityGroup(activityGroupRequest, activityGroupRequest.getActivityId());

        return ResponseEntity.ok(ApiResponse.success("Success", activityGroupResponse));
    }

    @GetMapping("/getAllGroup")
    public ResponseEntity<ApiResponse<List<ActivityGroupResponse>>> getAllGroup() {
        List<ActivityGroupResponse> activityGroupResponses = activityGroupService.getAllGroup();
        return ResponseEntity.ok(ApiResponse.success("Success", activityGroupResponses));
    }

}
