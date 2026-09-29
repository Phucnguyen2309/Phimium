package com.be.service;

import com.be.dto.response.LoginResponse;
import com.be.entity.User;

public interface AuthTokenService {
    void requireActive(User user);
    LoginResponse issue(User user);
}
