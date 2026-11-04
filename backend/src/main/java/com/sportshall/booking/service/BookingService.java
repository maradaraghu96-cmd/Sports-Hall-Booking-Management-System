
package com.sportshall.booking.service;

import com.sportshall.booking.entity.Booking;
import com.sportshall.booking.entity.BookingStatus;
import com.sportshall.booking.repository.BookingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public Booking createBooking(Booking booking) {

        validateBooking(booking);

        // Use a consistent key for the same hall.
        String hallKey = booking.getHallName()
            .trim()
            .toLowerCase(Locale.ROOT);

        LocalDate bookingDate = booking.getBookingDate();

        // Ensure the lock row exists before attempting to lock it.
        bookingRepository.createBookingLockIfMissing(
            hallKey,
            bookingDate
        );

        // Hold this database lock until the transaction completes.
        List<Object[]> lock =
            bookingRepository.lockBookingDay(hallKey, bookingDate);

        if (lock.isEmpty()) {
            throw new IllegalStateException(
                "Could not acquire the booking lock. Please try again."
            );
        }

        List<BookingStatus> blockingStatuses = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED
        );

        List<Booking> conflicts =
            bookingRepository.findOverlappingBookings(
                booking.getHallName(),
                bookingDate,
                booking.getStartTime(),
                booking.getEndTime(),
                blockingStatuses
            );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                "This sports hall is already booked for the selected time."
            );
        }

        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsForUser(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID.");
        }

        return bookingRepository
            .findByUserIdOrderByBookingDateDesc(userId);
    }

    private void validateBooking(Booking booking) {

        if (booking == null) {
            throw new IllegalArgumentException(
                "Booking details are required."
            );
        }

        if (booking.getHallName() == null
                || booking.getHallName().isBlank()) {
            throw new IllegalArgumentException(
                "Sports hall name is required."
            );
        }

        if (booking.getHallName().trim().length() > 100) {
            throw new IllegalArgumentException(
                "Sports hall name cannot exceed 100 characters."
            );
        }

        booking.setHallName(booking.getHallName().trim());

        if (booking.getSport() == null
                || booking.getSport().isBlank()) {
            throw new IllegalArgumentException(
                "Sport is required."
            );
        }

        if (booking.getSport().trim().length() > 50) {
            throw new IllegalArgumentException(
                "Sport name cannot exceed 50 characters."
            );
        }

        booking.setSport(booking.getSport().trim());

        if (booking.getBookingDate() == null) {
            throw new IllegalArgumentException(
                "Booking date is required."
            );
        }

        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Booking date cannot be in the past."
            );
        }

        if (booking.getStartTime() == null
                || booking.getEndTime() == null) {
            throw new IllegalArgumentException(
                "Start time and end time are required."
            );
        }

        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new IllegalArgumentException(
                "End time must be later than start time."
            );
        }

        if (booking.getUserId() == null
                || booking.getUserId() <= 0) {
            throw new IllegalArgumentException(
                "A valid user ID is required."
            );
        }
    }
}
