package com.alice.education.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.repository.PasswordResetTokenRepository;
import com.alice.education.repository.VerificationTokenRepository;

@Service
public class TokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupService.class);

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    /**
     * Clean up expired tokens every 10 minutes.
     */
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();

        log.info("Starting cleanup of expired tokens at {}", now);

        try {
            passwordResetTokenRepository.deleteByExpiryDateBefore(now);
            verificationTokenRepository.deleteByExpiryDateBefore(now);
            log.info("Cleanup completed successfully.");
        } catch (Exception e) {
            log.error("Error during token cleanup: {}", e.getMessage());
        }
    }
}
