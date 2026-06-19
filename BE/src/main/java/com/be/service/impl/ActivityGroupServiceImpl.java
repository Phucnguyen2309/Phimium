package com.be.service.impl;

import com.be.dto.request.ActivityGroupRequest;
import com.be.dto.response.ActivityGroupResponse;
import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.mapper.ActivityGroupMapper;
import com.be.repository.ActivityGroupRepository;
import com.be.repository.ActivityRepository;
import com.be.service.ActivityGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityGroupServiceImpl implements ActivityGroupService {
    private final ActivityGroupRepository activityGroupRepository;

    private final ActivityGroupMapper activityGroupMapper;

    private final ActivityRepository activityRepository;
    @Override
    public ActivityGroupResponse createActivityGroup(ActivityGroupRequest activityGroupRequest, UUID activityId) {
        Activity activity =  activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));

        ActivityGroup activityGroup = activityGroupMapper.toEntity(
                activityGroupRequest,
                activity
        );

        return activityGroupMapper.toResponse(activityGroupRepository.save(activityGroup));
    }

    @Override
    public List<ActivityGroupResponse> getAllGroup() {
        List<ActivityGroup> activityGroups = activityGroupRepository.findAll();
        return activityGroupMapper.toResponseList(activityGroups);
    }
}
