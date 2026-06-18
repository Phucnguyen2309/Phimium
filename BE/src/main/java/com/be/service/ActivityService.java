package com.be.service;

import com.be.dto.request.ActivityRequest;
import com.be.dto.response.ActivityResponse;
import com.be.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

public interface ActivityService {

    ActivityResponse createActivity(ActivityRequest activityRequest, MultipartFile image, User currentUser) throws IOException;
}
