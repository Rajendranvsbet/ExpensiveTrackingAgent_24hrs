package com.expensetracker.service;

import com.expensetracker.dto.AuthResponseDto;
import com.expensetracker.dto.LoginDto;
import com.expensetracker.dto.UserDto;

public interface AuthService {
    AuthResponseDto login(LoginDto loginDto);
    AuthResponseDto register(UserDto userDto);
    UserDto getProfile(String email);
    UserDto updateProfile(String email, UserDto userDto);
    void changePassword(String email, String oldPassword, String newPassword);
    void deleteAccount(String email);
}
