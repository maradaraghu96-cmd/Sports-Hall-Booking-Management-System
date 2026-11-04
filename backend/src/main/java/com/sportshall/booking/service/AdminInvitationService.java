
package com.sportshall.booking.service;

import com.sportshall.booking.entity.AdminInvitation;
import com.sportshall.booking.entity.User;
import com.sportshall.booking.entity.UserRole;
import com.sportshall.booking.repository.AdminInvitationRepository;
import com.sportshall.booking.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class AdminInvitationService {

    private final AdminInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AdminInvitationService(
            AdminInvitationRepository invitationRepository,
            UserRepository userRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {

        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // Create and email a new Normal Admin invitation.
    @Transactional
    public void inviteAdmin(
            String recipientEmail,
            String inviterEmail) {

        User inviter = userRepository
                .findByEmail(normalizeEmail(inviterEmail))
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Inviting account was not found."
                        ));

        if (inviter.getRole() != UserRole.SUPER_ADMIN
                || !inviter.isEmailVerified()) {
            throw new AccessDeniedException(
                    "Only a verified Super Admin can invite administrators."
            );
        }

        String email = normalizeEmail(recipientEmail);

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException(
                    "Enter a valid email address."
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account already exists for this email."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // Mark expired, unused invitations for this email as used.
        List<AdminInvitation> existingInvitations =
                invitationRepository.findAll().stream()
                        .filter(invitation ->
                                invitation.getEmail()
                                        .equalsIgnoreCase(email))
                        .toList();

        for (AdminInvitation existing : existingInvitations) {
            if (!existing.isUsed()
                    && !existing.getExpiresAt().isAfter(now)) {
                existing.setUsed(true);
                invitationRepository.save(existing);
            }
        }

        boolean hasActiveInvitation =
                invitationRepository.findAll().stream()
                        .anyMatch(invitation ->
                                invitation.getEmail()
                                        .equalsIgnoreCase(email)
                                && !invitation.isUsed()
                                && invitation.getExpiresAt()
                                        .isAfter(now));

        if (hasActiveInvitation) {
            throw new IllegalArgumentException(
                    "An active invitation already exists for this email."
            );
        }

        // Generate a cryptographically secure random token.
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);

        AdminInvitation invitation = new AdminInvitation();
        invitation.setEmail(email);
        invitation.setInvitedByEmail(inviter.getEmail());
        invitation.setRole(UserRole.ADMIN);
        invitation.setTokenHash(sha256(rawToken));
        invitation.setExpiresAt(now.plusHours(24));
        invitation.setUsed(false);

        invitationRepository.saveAndFlush(invitation);

        String baseUrl = frontendUrl.replaceAll("/+$", "");
        String invitationLink = baseUrl
                + "/accept-admin-invitation?token="
                + rawToken;

        // Send invitation email.
        emailService.sendAdminInvitationEmail(
                email,
                inviter.getEmail(),
                invitationLink,
                invitation.getExpiresAt()
        );
    }

    // Accept an invitation and create a Normal Admin account.
    @Transactional
    public void acceptInvitation(
            String rawToken,
            String fullName,
            String newPassword) {

        if (rawToken == null || rawToken.isBlank()
                || rawToken.length() > 200) {
            throw new IllegalArgumentException(
                    "Invalid invitation token."
            );
        }

        if (fullName == null || fullName.isBlank()
                || fullName.trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Enter a valid name (maximum 100 characters)."
            );
        }

        if (newPassword == null
                || newPassword.length() < 12
                || newPassword.length() > 72) {
            throw new IllegalArgumentException(
                    "Password must contain between 12 and 72 characters."
            );
        }

        String tokenHash = sha256(rawToken);

        // Lock the invitation row while validating and consuming the token.
        AdminInvitation invitation = invitationRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid invitation token."
                        ));

        if (invitation.isUsed()) {
            throw new IllegalArgumentException(
                    "This invitation has already been used."
            );
        }

        if (!invitation.getExpiresAt()
                .isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "This invitation has expired."
            );
        }

        // Invitations must only create Normal Admin accounts.
        if (invitation.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException(
                    "Invalid invitation role."
            );
        }

        String email = normalizeEmail(invitation.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account already exists for this email."
            );
        }

        User newAdmin = new User();
        newAdmin.setFullName(fullName.trim());
        newAdmin.setEmail(email);
        newAdmin.setPassword(passwordEncoder.encode(newPassword));
        newAdmin.setRole(UserRole.ADMIN);
        newAdmin.setEmailVerified(true);

        // Save the account and consume the invitation in one transaction.
        userRepository.save(newAdmin);

        invitation.setUsed(true);
        invitationRepository.save(invitation);
    }

    private String normalizeEmail(String email) {
        return email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);
    }

    private String sha256(String token) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to secure invitation token.",
                    exception
            );
        }
    }
}
