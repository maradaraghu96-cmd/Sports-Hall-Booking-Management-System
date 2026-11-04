
package com.sportshall.booking;

import com.sportshall.booking.entity.Booking;
import com.sportshall.booking.entity.BookingStatus;
import com.sportshall.booking.entity.User;
import com.sportshall.booking.repository.BookingRepository;
import com.sportshall.booking.repository.UserRepository;
import com.sportshall.booking.service.EmailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private static final Logger logger =
            LoggerFactory.getLogger(AdminBookingController.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AdminBookingController(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Get all bookings
    @GetMapping
    public List<AdminBookingResponse> getAllBookings() {

        return bookingRepository.findAll().stream()
                .sorted(
                        Comparator
                                .comparing(Booking::getBookingDate)
                                .thenComparing(Booking::getStartTime)
                )
                .map(this::toResponse)
                .toList();
    }

    // Get pending bookings
    @GetMapping("/pending")
    public List<AdminBookingResponse> getPendingBookings() {

        return bookingRepository.findAll().stream()
                .filter(booking ->
                        booking.getStatus() == BookingStatus.PENDING)
                .sorted(
                        Comparator
                                .comparing(Booking::getBookingDate)
                                .thenComparing(Booking::getStartTime)
                )
                .map(this::toResponse)
                .toList();
    }

    // Approve a booking
    @PatchMapping("/{id}/approve")
    public AdminBookingResponse approveBooking(
            @PathVariable Long id,
            Authentication authentication) {

        requireAdmin(authentication);

        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending bookings can be approved."
            );
        }

        List<Booking> conflicts =
                bookingRepository.findOverlappingBookings(
                        booking.getHallName(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime(),
                        List.of(BookingStatus.APPROVED)
                );

        boolean hasConflict = conflicts.stream()
                .anyMatch(other ->
                        !other.getId().equals(booking.getId()));

        if (hasConflict) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This time slot conflicts with another approved booking."
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);

        Booking approvedBooking = bookingRepository.save(booking);

        // Send approval email
        try {
            User user = userRepository.findById(
                    approvedBooking.getUserId()
            ).orElse(null);

            if (user != null
                    && user.getEmail() != null
                    && !user.getEmail().isBlank()) {

                emailService.sendBookingApprovalEmail(
                        user.getEmail(),
                        user.getFullName(),
                        approvedBooking
                );

                logger.info(
                        "Approval email sent for booking {}.",
                        approvedBooking.getId()
                );

            } else {
                logger.error(
                        "Could not find email recipient for booking {}.",
                        approvedBooking.getId()
                );
            }

        } catch (Exception exception) {
            logger.error(
                    "Booking {} was approved, but email delivery failed.",
                    approvedBooking.getId(),
                    exception
            );
        }

        return toResponse(approvedBooking);
    }

    // Reject a booking and email the rejection reason
    @PatchMapping("/{id}/reject")
    public AdminBookingResponse rejectBooking(
            @PathVariable Long id,
            @RequestBody RejectBookingRequest request,
            Authentication authentication) {

        requireAdmin(authentication);

        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending bookings can be rejected."
            );
        }

        if (request == null
                || request.reasonType() == null
                || request.reasonType().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a rejection reason."
            );
        }

        String reasonType = request.reasonType().trim();

        String customReason = request.customReason() == null
                ? ""
                : request.customReason().trim();

        String rejectionReason;

        switch (reasonType) {

            case "SLOT_UNAVAILABLE" ->
                    rejectionReason =
                            "Requested time slot is unavailable.";

            case "MAINTENANCE" ->
                    rejectionReason =
                            "The sports hall is under maintenance.";

            case "POLICY_VIOLATION" ->
                    rejectionReason =
                            "The booking does not meet the facility's booking policy.";

            case "INCOMPLETE_INFORMATION" ->
                    rejectionReason =
                            "The booking information requires clarification.";

            case "OTHER" -> {
                if (customReason.isBlank()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Please enter a custom rejection reason."
                    );
                }

                rejectionReason = customReason;
            }

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid rejection reason type."
            );
        }

        // Save rejection status and reason in the database
        booking.setRejectionReason(rejectionReason);
        booking.setStatus(BookingStatus.REJECTED);

        Booking rejectedBooking = bookingRepository.save(booking);

        logger.info(
                "Booking {} rejected. Reason: {}",
                rejectedBooking.getId(),
                rejectionReason
        );

        // Send rejection email to the user
        try {
            User user = userRepository.findById(
                    rejectedBooking.getUserId()
            ).orElse(null);

            if (user != null
                    && user.getEmail() != null
                    && !user.getEmail().isBlank()) {

                emailService.sendBookingRejectionEmail(
                        user.getEmail(),
                        user.getFullName(),
                        rejectedBooking,
                        rejectionReason
                );

                logger.info(
                        "Rejection email sent for booking {} to {}.",
                        rejectedBooking.getId(),
                        user.getEmail()
                );

            } else {
                logger.error(
                        "Booking {} was rejected, but no email recipient was found.",
                        rejectedBooking.getId()
                );
            }

        } catch (Exception exception) {
            logger.error(
                    "Booking {} was rejected, but the rejection email failed.",
                    rejectedBooking.getId(),
                    exception
            );
        }

        return toResponse(rejectedBooking);
    }

    // Find booking by ID
    private Booking findBooking(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Booking not found."
                        )
                );
    }

    // Verify administrator access
    private void requireAdmin(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(authority -> {
                        String role = authority.getAuthority();

                        return role.equals("ROLE_ADMIN")
                                || role.equals("ROLE_SUPER_ADMIN");
                    })) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access is required."
            );
        }
    }

    // Convert booking entity into API response
    private AdminBookingResponse toResponse(Booking booking) {

        User user = userRepository.findById(booking.getUserId())
                .orElse(null);

        return new AdminBookingResponse(
                booking.getId(),
                user != null ? user.getFullName() : "Unknown user",
                user != null ? user.getEmail() : "",
                booking.getHallName(),
                booking.getSport(),
                booking.getBookingDate().toString(),
                booking.getStartTime().toString(),
                booking.getEndTime().toString(),
                booking.getStatus().name(),
                booking.getRejectionReason()
        );
    }

    // Request body for rejecting a booking
    public record RejectBookingRequest(
            String reasonType,
            String customReason
    ) {}

    // Response returned to the admin frontend
    public record AdminBookingResponse(
            Long id,
            String userName,
            String userEmail,
            String hallName,
            String sport,
            String bookingDate,
            String startTime,
            String endTime,
            String status,
            String rejectionReason
    ) {}
}
