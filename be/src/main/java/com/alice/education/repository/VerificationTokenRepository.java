package com.alice.education.repository;

import com.alice.education.model.Account;
import com.alice.education.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    
    Optional<VerificationToken> findByToken(String token);
    
    Optional<VerificationToken> findByAccount(Account account);
    
    void deleteByAccount(Account account);
}
