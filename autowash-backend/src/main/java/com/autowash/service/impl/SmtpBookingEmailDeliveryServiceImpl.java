package com.autowash.service.impl;

import com.autowash.entity.Booking;
import com.autowash.service.BookingEmailDeliveryService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "smtp")
public class SmtpBookingEmailDeliveryServiceImpl implements BookingEmailDeliveryService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;

    public SmtpBookingEmailDeliveryServiceImpl(
            JavaMailSender mailSender,
            @Value("${autowash.email.from}") String from,
            @Value("${autowash.email.from-name:AURA Car Wash}") String fromName
    ) {
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void sendBookingConfirmation(Booking booking, String email) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(email);
            helper.setSubject("AURA Car Wash booking confirmation");
            helper.setText(textBody(booking), htmlBody(booking));
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException exception) {
            throw new IllegalStateException("Unable to build booking confirmation email", exception);
        }
    }

    private String textBody(Booking booking) {
        return """
                Your AURA Car Wash booking has been created successfully.

                Booking ID: %s
                Schedule: %s at %s
                Amount: %,d VND
                Status: %s

                Please arrive on time so our staff can check you in.
                If you did not create this booking, please contact AURA Car Wash support.
                """.formatted(
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getFinalAmount(),
                booking.getStatus().name()
        );
    }

    private String htmlBody(Booking booking) {
        return """
                <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
                  <h2 style="margin:0 0 12px">AURA Car Wash booking confirmation</h2>
                  <p>Your booking has been created successfully.</p>
                  <p>Booking ID: <strong>%s</strong></p>
                  <p>Schedule: <strong>%s at %s</strong></p>
                  <p>Amount: <strong>%,d VND</strong></p>
                  <p>Status: <strong>%s</strong></p>
                  <p>Please arrive on time so our staff can check you in.</p>
                  <p style="color:#64748b">If you did not create this booking, please contact AURA Car Wash support.</p>
                </div>
                """.formatted(
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getFinalAmount(),
                booking.getStatus().name()
        );
    }
}
