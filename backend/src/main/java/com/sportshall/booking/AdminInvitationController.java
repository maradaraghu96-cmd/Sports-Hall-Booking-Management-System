
package com.sportshall.booking.controller;

import com.sportshall.booking.service.AdminInvitationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/invitations")
public class AdminInvitationController {

    private final AdminInvitationService invitationService;

    public AdminInvitationController(
            AdminInvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> inviteAdmin(
            @RequestBody InviteAdminRequest request,
            Authentication authentication) {

        // Require an authenticated Super Admin.
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(authority ->
                        authority.getAuthority()
                            .equals("ROLE_SUPER_ADMIN"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only Super Admin can invite administrators."
                    ));
        }

        if (request == null
                || request.email() == null
                || request.email().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Recipient email is required."
                    ));
        }

        try {
            // Use the authenticated account's email.
            String inviterEmail = authentication.getName();

            invitationService.inviteAdmin(
                    request.email(),
                    inviterEmail
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message",
                            "Invitation email sent successfully."
                    ));

        } catch (AccessDeniedException exception) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only a verified Super Admin can invite administrators."
                    ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }

    public record InviteAdminRequest(String email) {
    }
}
