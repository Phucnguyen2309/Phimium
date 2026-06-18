package com.be.service;

import com.be.dto.request.LoginRequest;
import com.be.dto.request.RegisterRequest;
import com.be.dto.response.LoginResponse;
import com.be.dto.response.RegisterResponse;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);

    RegisterResponse register(RegisterRequest registerRequest);
}
