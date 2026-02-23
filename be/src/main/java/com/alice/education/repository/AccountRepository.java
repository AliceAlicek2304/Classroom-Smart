package com.alice.education.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Account;
import com.alice.education.model.Role;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    List<Account> findByRole(Role role);

    long countByRole(Role role);

    List<Account> findTop5ByRoleOrderByCreatedAtDesc(Role role);
}
