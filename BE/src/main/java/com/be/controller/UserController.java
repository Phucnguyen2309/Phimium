package com.be.controller;

import com.be.dto.response.ActivityResponse;
import com.be.dto.response.ApiResponse;
import com.be.entity.User;
import com.be.repository.ActivityRepository;
import com.be.repository.UserRepository;
import com.be.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityService activityService;

}
