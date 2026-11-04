
package com.sportshall.booking;

import com.sportshall.booking.dto.SendOtpRequest;
import com.sportshall.booking.dto.VerifyOtpRequest;
import com.sportshall.booking.service.EmailOtpService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpController {

    private final EmailOtpService emailOtpService;

    public OtpController(EmailOtpService emailOtpService) {
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        try {
            emailOtpService.sendOtp(request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message",
                    "If the account is eligible, a verification email has been sent."
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Unable to send OTP. Check the email and account status."
            ));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        try {
            emailOtpService.verifyOtp(
                    request.getEmail(),
                    request.getOtp()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Email verified successfully!"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    e.getMessage()
            ));
        }
    }
}
