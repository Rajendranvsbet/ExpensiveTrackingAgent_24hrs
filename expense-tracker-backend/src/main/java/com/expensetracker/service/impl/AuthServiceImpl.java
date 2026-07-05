package com.expensetracker.service.impl;

import com.expensetracker.dto.AuthResponseDto;
import com.expensetracker.dto.LoginDto;
import com.expensetracker.dto.UserDto;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.exception.DuplicateEmailException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtTokenProvider;
import com.expensetracker.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ModelMapper modelMapper;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider,
                           ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.modelMapper = modelMapper;
    }

    @Override
    public AuthResponseDto login(LoginDto loginDto) {
        log.info("Attempting to authenticate user: {}", loginDto.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", loginDto.getEmail()));

        log.info("User {} successfully authenticated", loginDto.getEmail());
        
        return AuthResponseDto.builder()
                .accessToken(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDto register(UserDto userDto) {
        log.info("Attempting registration for email: {}", userDto.getEmail());
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            log.error("Registration failed - email already in use: {}", userDto.getEmail());
            throw new DuplicateEmailException(userDto.getEmail());
        }

        User user = User.builder()
                .fullName(userDto.getFullName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .phone(userDto.getPhone())
                .role(Role.USER) // Defaults to USER role
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user successfully registered with id: {}", savedUser.getId());

        // Perform login immediately after successful registration to return a JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDto.getEmail(), userDto.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponseDto.builder()
                .accessToken(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    @Transactional
    public UserDto updateProfile(String email, UserDto userDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        user.setFullName(userDto.getFullName());
        user.setPhone(userDto.getPhone());

        User updatedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", email);
        return modelMapper.map(updatedUser, UserDto.class);
    }

    @Override
    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password provided.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password successfully updated for user: {}", email);
    }

    @Override
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        userRepository.delete(user);
        log.warn("Account completely deleted for user: {}", email);
    }
}
