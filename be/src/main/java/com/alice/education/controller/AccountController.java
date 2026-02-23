package com.alice.education.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.StudentResponse;
import com.alice.education.model.Account;
import com.alice.education.model.Role;
import com.alice.education.repository.AccountRepository;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getTeachers() {
        try {
            List<Account> teachers = accountRepository.findByRole(Role.TEACHER);
            List<StudentResponse> responses = teachers.stream()
                    .map(a -> new StudentResponse(a.getId(), a.getUsername(), a.getFullName(), a.getEmail(),
                            a.getBirthDay(), a.getIsActive()))
                    .toList();
            return ApiResponse.success("Lấy danh sách giáo viên thành công!", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudents() {
        try {
            List<Account> students = accountRepository.findByRole(Role.CUSTOMER);
            List<StudentResponse> responses = students.stream()
                    .map(a -> new StudentResponse(a.getId(), a.getUsername(), a.getFullName(), a.getEmail(),
                            a.getBirthDay(), a.getIsActive()))
                    .toList();
            return ApiResponse.success("Lấy danh sách học sinh thành công!", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> toggleActive(@PathVariable Long id) {
        try {
            Account account = accountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
            account.setIsActive(!account.getIsActive());
            accountRepository.save(account);
            StudentResponse response = new StudentResponse(
                    account.getId(), account.getUsername(), account.getFullName(),
                    account.getEmail(), account.getBirthDay(), account.getIsActive());
            String msg = account.getIsActive() ? "Kích hoạt tài khoản thành công!"
                    : "Vô hiệu hóa tài khoản thành công!";
            return ApiResponse.success(msg, response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
