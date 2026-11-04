
package com.sportshall.booking.controller;

import com.sportshall.booking.service.AdminInvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin-invitations")
public class AdminInvitationAcceptanceController {

    private final AdminInvitationService invitationService;

    public AdminInvitationAcceptanceController(
            AdminInvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(
            @RequestBody AcceptInvitationRequest request) {

        if (request == null
                || request.token() == null
                || request.fullName() == null
                || request.password() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Token, full name, and password are required.")
            );
        }

        try {
            invitationService.acceptInvitation(
                    request.token(),
                    request.fullName(),
                    request.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("message",
                            "Admin account created successfully. You can now log in.")
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    public record AcceptInvitationRequest(
            String token,
            String fullName,
            String password) {
    }
}
