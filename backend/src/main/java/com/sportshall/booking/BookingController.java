
package com.sportshall.booking;

import com.sportshall.booking.entity.Booking;
import com.sportshall.booking.entity.BookingStatus;
import com.sportshall.booking.entity.User;
import com.sportshall.booking.repository.BookingRepository;
import com.sportshall.booking.repository.UserRepository;
import com.sportshall.booking.service.BookingService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(
            BookingService bookingService,
            BookingRepository bookingRepository,
            UserRepository userRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Booking booking = new Booking();
        booking.setHallName(request.hallName());
        booking.setSport(request.sport());
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());

        // Never accept the user ID from the request body.
        booking.setUserId(user.getId());

        try {
            Booking saved = bookingService.createBooking(booking);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Your booking request has been submitted.",
                    "bookingId", saved.getId(),
                    "status", saved.getStatus().name()
                )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                Map.of("message", exception.getMessage())
            );
        }
    }

    @GetMapping("/availability")
    public Map<String, Object> checkAvailability(
            @RequestParam String hallName,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate bookingDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
            LocalTime startTime,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
            LocalTime endTime) {

        if (hallName.isBlank()
                || hallName.length() > 100
                || bookingDate == null
                || startTime == null
                || endTime == null
                || !endTime.isAfter(startTime)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please provide valid hall, date, and time details."
            );
        }

       

        List<BookingStatus> blockingStatuses = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED
        );

        List<Booking> conflicts =
            bookingRepository.findOverlappingBookings(
                hallName.trim(),
                bookingDate,
                startTime,
                endTime,
                blockingStatuses
            );

        return Map.of(
            "hallName", hallName.trim(),
            "bookingDate", bookingDate.toString(),
            "startTime", startTime.toString(),
            "endTime", endTime.toString(),
            "available", conflicts.isEmpty()
        );
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return bookingService.getBookingsForUser(user.getId());
    }

    private User getAuthenticatedUser(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please log in to continue."
            );
        }

        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user was not found."
            ));
    }

    public record BookingRequest(
        String hallName,
        String sport,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime
    ) {}
}
