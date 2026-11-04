
package com.sportshall.booking.service;

import com.sportshall.booking.entity.EmailOtp;
import com.sportshall.booking.entity.User;
import com.sportshall.booking.repository.EmailOtpRepository;
import com.sportshall.booking.repository.UserRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class EmailOtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final EmailOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public EmailOtpService(
            EmailOtpRepository otpRepository,
            UserRepository userRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // Send a six-digit OTP to an existing, unverified account.
    @Transactional
    public void sendOtp(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No account exists with this email."));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "This email is already verified.");
        }

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        EmailOtp record = otpRepository
                .findByEmail(normalizedEmail)
                .orElseGet(EmailOtp::new);

        record.setEmail(normalizedEmail);
        record.setOtpHash(passwordEncoder.encode(otp));
        record.setExpiresAt(
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        record.setAttempts(0);
        record.setUsed(false);

        otpRepository.save(record);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(normalizedEmail);
        message.setSubject(
                "Sports Hall Booking System - Email Verification");

        message.setText(
                "Hello " + user.getFullName() + ",\n\n"
                + "Your email verification code is: " + otp + "\n\n"
                + "This code expires in 5 minutes. "
                + "Do not share it with anyone.\n\n"
                + "If you did not request this code, please ignore this email."
        );

        mailSender.send(message);
    }

    // Verify the OTP and mark the user's email as verified.
    @Transactional
    public void verifyOtp(String email, String otp) {

        String normalizedEmail = email.trim().toLowerCase();

        EmailOtp record = otpRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "OTP not found. Please request a new OTP."));

        if (record.isUsed()) {
            throw new IllegalArgumentException(
                    "This OTP has already been used.");
        }

        if (!LocalDateTime.now().isBefore(record.getExpiresAt())) {
            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new OTP.");
        }

        if (record.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Maximum attempts reached. Please request a new OTP.");
        }

        // Count each verification attempt, including incorrect attempts.
        record.setAttempts(record.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            // Persist the failed attempt before returning an error.
            otpRepository.saveAndFlush(record);

            throw new IllegalArgumentException(
                    "Invalid OTP. Please check the code and try again.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Account not found."));

        if (user.isEmailVerified()) {
            record.setUsed(true);
            otpRepository.save(record);

            throw new IllegalArgumentException(
                    "This email is already verified.");
        }

        // Mark the account as verified.
        user.setEmailVerified(true);
        userRepository.save(user);

        // Prevent this OTP from being used again.
        record.setUsed(true);
        otpRepository.save(record);
    }
}
