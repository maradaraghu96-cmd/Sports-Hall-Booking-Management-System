
package com.sportshall.booking.repository;

import com.sportshall.booking.entity.Booking;
import com.sportshall.booking.entity.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Modifying
    @Query(value = """
        INSERT INTO booking_slot_locks (hall_key, booking_date)
        VALUES (:hallKey, :bookingDate)
        ON DUPLICATE KEY UPDATE hall_key = VALUES(hall_key)
        """, nativeQuery = true)
    void createBookingLockIfMissing(
        @Param("hallKey") String hallKey,
        @Param("bookingDate") LocalDate bookingDate
    );

    @Query(value = """
    SELECT *
    FROM booking_slot_locks
    WHERE hall_key = :hallKey
      AND booking_date = :bookingDate
    FOR UPDATE
    """, nativeQuery = true)
List<Object[]> lockBookingDay(
    @Param("hallKey") String hallKey,
    @Param("bookingDate") LocalDate bookingDate
);

    @Query("""
        SELECT b FROM Booking b
        WHERE LOWER(b.hallName) = LOWER(:hallName)
          AND b.bookingDate = :bookingDate
          AND b.status IN :statuses
          AND b.startTime < :endTime
          AND b.endTime > :startTime
        """)
    List<Booking> findOverlappingBookings(
        @Param("hallName") String hallName,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);
}
