package com.alice.education.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.alice.education.model.Account;
import com.alice.education.model.Provider;
import com.alice.education.model.Role;
import com.alice.education.model.Subject;
import com.alice.education.model.Textbook;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.SubjectRepository;
import com.alice.education.repository.TextbookRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TextbookRepository textbookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (accountRepository.count() > 0) {
            System.out.println("Database already has data. Skipping initialization.");
            return;
        }

        System.out.println("Initializing database with default accounts...");

        // Create ADMIN account
        Account admin = new Account();
        admin.setFullName("Administrator");
        admin.setUsername("admin");
        admin.setEmail("admin@educationai.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setProvider(Provider.LOCAL);
        admin.setIsActive(true);
        accountRepository.save(admin);
        System.out.println("✓ Created ADMIN account - username: admin, password: admin123");

        // Create TEACHER account
        Account teacher = new Account();
        teacher.setFullName("Teacher Demo");
        teacher.setUsername("teacher");
        teacher.setEmail("teacher@educationai.com");
        teacher.setPassword(passwordEncoder.encode("teacher123"));
        teacher.setRole(Role.TEACHER);
        teacher.setProvider(Provider.LOCAL);
        teacher.setIsActive(true);
        accountRepository.save(teacher);
        System.out.println("✓ Created TEACHER account - username: teacher, password: teacher123");

        // Create CUSTOMER account
        Account customer = new Account();
        customer.setFullName("Customer Demo");
        customer.setUsername("customer");
        customer.setEmail("customer@educationai.com");
        customer.setPassword(passwordEncoder.encode("customer123"));
        customer.setRole(Role.CUSTOMER);
        customer.setProvider(Provider.LOCAL);
        customer.setIsActive(true);
        accountRepository.save(customer);
        System.out.println("✓ Created CUSTOMER account - username: customer, password: customer123");

        // Initialize Subjects
        System.out.println("Initializing default subjects...");
        Subject toan = new Subject("Toán học", "Môn Toán học cơ bản", 6);
        subjectRepository.save(toan);

        Subject van = new Subject("Ngữ văn", "Môn Ngữ văn cơ bản", 6);
        subjectRepository.save(van);

        System.out.println("✓ Created initial subjects (Toán, Văn - Lớp 6)");

        // Initialize Textbooks
        System.out.println("Initializing default textbooks...");
        Textbook toanTextbook = new Textbook("Toán học 6 - Tập 1", "NXB Giáo dục", 2024, 6, toan);
        textbookRepository.save(toanTextbook);

        Textbook vanTextbook = new Textbook("Ngữ văn 6 - Tập 1", "NXB Giáo dục", 2024, 6, van);
        textbookRepository.save(vanTextbook);

        System.out.println("✓ Created initial textbooks");

        System.out.println("Database initialization completed successfully!");
    }
}
