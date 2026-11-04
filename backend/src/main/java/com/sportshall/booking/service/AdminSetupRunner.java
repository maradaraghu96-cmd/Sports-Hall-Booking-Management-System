
package com.sportshall.booking.service;

import com.sportshall.booking.entity.User;
import com.sportshall.booking.entity.UserRole;
import com.sportshall.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("admin-setup")
public class AdminSetupRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public AdminSetupRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters."
            );
        }

        adminEmail = adminEmail.trim().toLowerCase();

        if (userRepository.existsByEmail(adminEmail)) {
            throw new IllegalStateException(
                    "An account with ADMIN_EMAIL already exists. "
                    + "No account was changed. Use a different email or "
                    + "verify the existing account's role."
            );
        }

        User admin = new User();
        admin.setFullName("System Administrator");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setEmailVerified(true);

        userRepository.save(admin);

        System.out.println(
                "Admin account created successfully for: " + adminEmail
        );
    }
}
