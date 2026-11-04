
package com.sportshall.booking.service;

import com.sportshall.booking.entity.Booking;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Existing email test method
    public void sendTestEmail(String recipient) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipient);
        message.setSubject(
                "Sports Hall Booking System - Email Test"
        );

        message.setText(
                "Hello!\n\n" +
                "Your Sports Hall Booking System email " +
                "configuration is working.\n\n" +
                "We will use this service for email OTP verification."
        );

        mailSender.send(message);
    }

    // Existing booking approval email
    public void sendBookingApprovalEmail(
            String recipient,
            String userName,
            Booking booking) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipient);
        message.setSubject(
                "Sports Hall Booking - Approval Confirmed"
        );

        String greetingName =
                userName == null || userName.isBlank()
                        ? "User"
                        : userName;

        String emailText =
                "Hello " + greetingName + ",\n\n" +
                "BANG! \uD83D\uDCA5\n\n" +
                "Good news! Your sports hall booking request " +
                "has been approved by the administrator.\n\n" +
                "Booking Details\n" +
                "------------------------------\n" +
                "Booking ID: " + booking.getId() + "\n" +
                "Sports Hall: " + booking.getHallName() + "\n" +
                "Sport: " + booking.getSport() + "\n" +
                "Booking Date: " + booking.getBookingDate() + "\n" +
                "Start Time: " + booking.getStartTime() + "\n" +
                "End Time: " + booking.getEndTime() + "\n" +
                "Status: APPROVED\n\n" +
                "Please keep this email for your reference.\n\n" +
                "Thank you for using the Sports Hall Booking " +
                "Management System!\n\n" +
                "We look forward to seeing you on the court!";

        message.setText(emailText);
        mailSender.send(message);
    }

    // NEW: Booking rejection email including the administrator's reason
    public void sendBookingRejectionEmail(
            String recipient,
            String userName,
            Booking booking,
            String rejectionReason) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipient);
        message.setSubject(
                "Sports Hall Booking - Request Rejected"
        );

        String greetingName =
                userName == null || userName.isBlank()
                        ? "User"
                        : userName;

        String reason =
                rejectionReason == null || rejectionReason.isBlank()
                        ? "No specific reason was provided."
                        : rejectionReason;

        String emailText =
                "Hello " + greetingName + ",\n\n" +
                "We regret to inform you that your sports hall " +
                "booking request has been rejected by the administrator.\n\n" +
                "Booking Details\n" +
                "------------------------------\n" +
                "Booking ID: " + booking.getId() + "\n" +
                "Sports Hall: " + booking.getHallName() + "\n" +
                "Sport: " + booking.getSport() + "\n" +
                "Booking Date: " + booking.getBookingDate() + "\n" +
                "Start Time: " + booking.getStartTime() + "\n" +
                "End Time: " + booking.getEndTime() + "\n" +
                "Status: REJECTED\n\n" +
                "Reason for Rejection\n" +
                "------------------------------\n" +
                reason + "\n\n" +
                "If you have questions about this decision, " +
                "please contact the sports hall administrator.\n\n" +
                "Thank you for your understanding.\n\n" +
                "Sports Hall Booking Management System";

        message.setText(emailText);
        mailSender.send(message);
    }

    // Existing admin invitation email
    public void sendAdminInvitationEmail(
            String recipient,
            String inviterEmail,
            String invitationLink,
            LocalDateTime expiresAt) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipient);
        message.setSubject(
                "Sports Hall Booking System - Admin Invitation"
        );

        String expiry = expiresAt.format(
                DateTimeFormatter.ofPattern(
                        "dd MMM yyyy, hh:mm a"
                )
        );

        message.setText(
                "Hello,\n\n" +
                inviterEmail +
                " has invited you to become an administrator " +
                "of the Sports Hall Booking Management System.\n\n" +
                "Accept your invitation using this link:\n" +
                invitationLink + "\n\n" +
                "This invitation expires at " + expiry + ".\n" +
                "It can be used only once.\n\n" +
                "If you were not expecting this invitation, " +
                "you can ignore this email.\n\n" +
                "Sports Hall Booking Management System"
        );

        mailSender.send(message);
    }
}
