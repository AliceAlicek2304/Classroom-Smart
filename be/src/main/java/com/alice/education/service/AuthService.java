package com.alice.education.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.AccountResponse;
import com.alice.education.dto.AuthResponse;
import com.alice.education.dto.ChangePasswordRequest;
import com.alice.education.dto.ForgotPasswordRequest;
import com.alice.education.dto.LoginRequest;
import com.alice.education.dto.MessageResponse;
import com.alice.education.dto.RegisterRequest;
import com.alice.education.dto.ResetPasswordRequest;
import com.alice.education.dto.StudentResponse;
import com.alice.education.model.Account;
import com.alice.education.model.PasswordResetToken;
import com.alice.education.model.Provider;
import com.alice.education.model.Role;
import com.alice.education.model.VerificationToken;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.PasswordResetTokenRepository;
import com.alice.education.repository.VerificationTokenRepository;
import com.alice.education.security.JwtUtils;

import jakarta.mail.MessagingException;

@Service
public class AuthService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Transactional
    public MessageResponse register(RegisterRequest request) throws MessagingException {
        // Check if username exists
        if (accountRepository.existsByUsername(request.getUsername())) {
            return new MessageResponse("Tên đăng nhập đã tồn tại!", false);
        }

        // Check if email exists
        if (accountRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Email đã được sử dụng!", false);
        }

        // Create new account
        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(Role.CUSTOMER);
        account.setProvider(Provider.LOCAL);
        account.setIsActive(false); // Require email verification

        accountRepository.save(account);

        // Generate verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, account);
        verificationTokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(account.getEmail(), token);

        return new MessageResponse("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", true);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get account details
            Account account = accountRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is active (email verified)
            if (!account.getIsActive()) {
                AuthResponse response = new AuthResponse("Tài khoản chưa được xác thực. Vui lòng kiểm tra email!");
                return response;
            }

            // Generate JWT tokens
            String token = jwtUtils.generateToken(authentication);
            String refreshToken = jwtUtils.generateRefreshToken(authentication);

            // Create account response
            AccountResponse accountResponse = convertToAccountResponse(account);

            return new AuthResponse(token, refreshToken, accountResponse);

        } catch (BadCredentialsException e) {
            AuthResponse response = new AuthResponse("Tên đăng nhập hoặc mật khẩu không chính xác!");
            return response;
        }
    }

    @Transactional
    public MessageResponse verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElse(null);

        if (verificationToken == null) {
            return new MessageResponse("Token xác thực không hợp lệ!", false);
        }

        if (verificationToken.isExpired()) {
            return new MessageResponse("Token xác thực đã hết hạn!", false);
        }

        Account account = verificationToken.getAccount();
        account.setIsActive(true);
        accountRepository.save(account);

        // Delete verification token after successful verification
        verificationTokenRepository.delete(verificationToken);

        return new MessageResponse("Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.", true);
    }

    @Transactional
    public MessageResponse resendVerificationEmail(String email) throws MessagingException {
        Account account = accountRepository.findByEmail(email)
                .orElse(null);

        if (account == null) {
            return new MessageResponse("Email không tồn tại!", false);
        }

        if (account.getIsActive()) {
            return new MessageResponse("Tài khoản đã được xác thực!", false);
        }

        // Delete old verification token if exists
        verificationTokenRepository.findByAccount(account)
                .ifPresent(token -> verificationTokenRepository.delete(token));

        // Generate new verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, account);
        verificationTokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(account.getEmail(), token);

        return new MessageResponse("Email xác thực đã được gửi lại!", true);
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) throws MessagingException {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (account == null) {
            return new MessageResponse("Email không tồn tại trong hệ thống!", false);
        }

        // Delete old reset tokens for this account
        passwordResetTokenRepository.deleteByAccount(account);

        // Generate reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, account);
        passwordResetTokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(account.getEmail(), token);

        return new MessageResponse("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!", true);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElse(null);

        if (resetToken == null) {
            return new MessageResponse("Token đặt lại mật khẩu không hợp lệ!", false);
        }

        if (resetToken.isExpired()) {
            return new MessageResponse("Token đặt lại mật khẩu đã hết hạn!", false);
        }

        if (resetToken.getUsed()) {
            return new MessageResponse("Token đã được sử dụng!", false);
        }

        Account account = resetToken.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return new MessageResponse("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.", true);
    }

    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Validate refresh token
            if (!jwtUtils.validateJwtToken(refreshToken)) {
                return new AuthResponse("Refresh token không hợp lệ hoặc đã hết hạn!");
            }

            // Get username from token
            String username = jwtUtils.getUsernameFromJwtToken(refreshToken);
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!account.getIsActive()) {
                return new AuthResponse("Tài khoản chưa được kích hoạt!");
            }

            // Generate new tokens
            String newAccessToken = jwtUtils.generateTokenFromUsername(username);
            String newRefreshToken = jwtUtils.generateRefreshTokenFromUsername(username);

            AccountResponse accountResponse = convertToAccountResponse(account);
            return new AuthResponse(newAccessToken, newRefreshToken, accountResponse);

        } catch (Exception e) {
            return new AuthResponse("Refresh token không hợp lệ!");
        }
    }

    public AccountResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return convertToAccountResponse(account);
    }

    @Transactional
    public MessageResponse changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            return new MessageResponse("Mật khẩu cũ không đúng!", false);
        }

        // Check if new password is same as old password
        if (request.getOldPassword().equals(request.getNewPassword())) {
            return new MessageResponse("Mật khẩu mới phải khác mật khẩu cũ!", false);
        }

        // Update password
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        return new MessageResponse("Đổi mật khẩu thành công!", true);
    }

    private AccountResponse convertToAccountResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setFullName(account.getFullName());
        response.setBirthDay(account.getBirthDay());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());
        response.setAvatar(account.getAvatar());
        response.setIsActive(account.getIsActive());
        response.setRole(account.getRole());
        response.setProvider(account.getProvider());
        response.setCreatedAt(account.getCreatedAt());
        response.setEmailVerified(account.getIsActive());
        return response;
    }

    public java.util.List<StudentResponse> getAllStudents() {
        java.util.List<Account> students = accountRepository.findByRole(Role.CUSTOMER);
        return students.stream()
                .map(this::convertToStudentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private StudentResponse convertToStudentResponse(Account account) {
        return new StudentResponse(
                account.getId(),
                account.getUsername(),
                account.getFullName(),
                account.getEmail(),
                account.getBirthDay(),
                account.getIsActive());
    }
}
