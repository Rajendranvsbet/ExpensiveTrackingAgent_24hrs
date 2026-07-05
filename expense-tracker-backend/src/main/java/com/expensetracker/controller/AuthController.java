package com.expensetracker.controller;

import com.expensetracker.dto.AuthResponseDto;
import com.expensetracker.dto.LoginDto;
import com.expensetracker.dto.UserDto;
import com.expensetracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & Profiles", description = "Endpoints for user register, login, profiles, and account safety controls.")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register user account", description = "Signs up a new user and generates a login JWT instantly.")
    @ApiResponse(responseCode = "201", description = "Created - Account initialized successfully")
    @ApiResponse(responseCode = "400", description = "Bad Request - Validation or duplicate email checks failed")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody UserDto userDto) {
        AuthResponseDto response = authService.register(userDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login to account", description = "Verifies password and issues JWT Token.")
    @ApiResponse(responseCode = "200", description = "OK - Successfully verified")
    @ApiResponse(responseCode = "401", description = "Unauthorized - Incorrect username/email or password")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto loginDto) {
        AuthResponseDto response = authService.login(loginDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile details", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        UserDto profile = authService.getProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile details", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<UserDto> updateProfile(Authentication authentication, @Valid @RequestBody UserDto userDto) {
        UserDto profile = authService.updateProfile(authentication.getName(), userDto);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change profile password", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        authService.changePassword(authentication.getName(), oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/delete-account")
    @Operation(summary = "Completely delete account", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> deleteAccount(Authentication authentication) {
        authService.deleteAccount(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Account successfully terminated"));
    }
}
