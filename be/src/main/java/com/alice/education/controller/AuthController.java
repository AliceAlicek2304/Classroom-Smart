package com.alice.education.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.AccountResponse;
import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.AuthResponse;
import com.alice.education.dto.ChangePasswordRequest;
import com.alice.education.dto.ForgotPasswordRequest;
import com.alice.education.dto.LoginRequest;
import com.alice.education.dto.MessageResponse;
import com.alice.education.dto.RegisterRequest;
import com.alice.education.dto.ResetPasswordRequest;
import com.alice.education.dto.StudentResponse;
import com.alice.education.service.AuthService;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MessageResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            MessageResponse response = authService.register(request);
            if (response.isSuccess()) {
                return ApiResponse.success(response.getMessage(), response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (MessagingException e) {
            return ApiResponse.error("Lỗi khi gửi email xác thực. Vui lòng thử lại!");
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            if (response.getToken() != null) {
                return ApiResponse.success("Đăng nhập thành công!", response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<MessageResponse>> verifyEmail(@RequestParam("token") String token) {
        try {
            MessageResponse response = authService.verifyEmail(token);
            if (response.isSuccess()) {
                return ApiResponse.success(response.getMessage(), response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<MessageResponse>> resendVerificationEmail(@RequestParam("email") String email) {
        try {
            MessageResponse response = authService.resendVerificationEmail(email);
            if (response.isSuccess()) {
                return ApiResponse.success(response.getMessage(), response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (MessagingException e) {
            return ApiResponse.error("Lỗi khi gửi email. Vui lòng thử lại!");
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<MessageResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            MessageResponse response = authService.forgotPassword(request);
            return ApiResponse.success(response.getMessage(), response);
        } catch (MessagingException e) {
            return ApiResponse.error("Lỗi khi gửi email. Vui lòng thử lại!");
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<MessageResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            MessageResponse response = authService.resetPassword(request);
            if (response.isSuccess()) {
                return ApiResponse.success(response.getMessage(), response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        return ApiResponse.success("API đang hoạt động!", "API is working!");
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam("refreshToken") String refreshToken) {
        try {
            AuthResponse response = authService.refreshToken(refreshToken);
            if (response.getToken() != null) {
                return ApiResponse.success("Token đã được làm mới!", response);
            } else {
                return ApiResponse.unauthorized(response.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.unauthorized("Refresh token không hợp lệ!");
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AccountResponse>> getCurrentUser() {
        try {
            AccountResponse response = authService.getCurrentUser();
            return ApiResponse.success("Lấy thông tin người dùng thành công!", response);
        } catch (Exception e) {
            return ApiResponse.unauthorized("Vui lòng đăng nhập!");
        }
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<MessageResponse>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            MessageResponse response = authService.changePassword(request);
            if (response.isSuccess()) {
                return ApiResponse.success(response.getMessage(), response);
            } else {
                return ApiResponse.error(response.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<StudentResponse>>> getAllStudents() {
        try {
            java.util.List<StudentResponse> students = authService.getAllStudents();
            return ApiResponse.success("Lấy danh sách học sinh thành công!", students);
        } catch (Exception e) {
            return ApiResponse.error("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
}
