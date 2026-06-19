package com.be.service;

import com.be.dto.request.ActivityGroupRequest;
import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.entity.ActivityGroup;
import com.be.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ActivityGroupService {
    ActivityGroupResponse createActivityGroup(ActivityGroupRequest activityGroupRequest, UUID activityId);

    List<ActivityGroupResponse> getAllGroup();
}
