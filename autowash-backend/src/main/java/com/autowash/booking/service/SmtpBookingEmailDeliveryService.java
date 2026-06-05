package com.autowash.booking.service;

import com.autowash.booking.entity.CustomerBooking;
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
public class SmtpBookingEmailDeliveryService implements BookingEmailDeliveryService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;

    public SmtpBookingEmailDeliveryService(
            JavaMailSender mailSender,
            @Value("${autowash.email.from}") String from,
            @Value("${autowash.email.from-name:AURA Car Wash}") String fromName
    ) {
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void sendBookingOtp(CustomerBooking booking, String email, String otp, int expiresInSeconds) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(email);
            helper.setSubject("AURA Car Wash booking OTP");
            helper.setText(textBody(booking, otp, expiresInSeconds), htmlBody(booking, otp, expiresInSeconds));
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException exception) {
            throw new IllegalStateException("Unable to build booking OTP email", exception);
        }
    }

    private String textBody(CustomerBooking booking, String otp, int expiresInSeconds) {
        int minutes = Math.max(expiresInSeconds / 60, 1);
        return """
                Your AURA Car Wash booking OTP is %s.

                Booking ID: %s
                This OTP expires in %d minutes and can only be used once.
                If you did not create this booking, please ignore this email.
                """.formatted(otp, booking.getId(), minutes);
    }

    private String htmlBody(CustomerBooking booking, String otp, int expiresInSeconds) {
        int minutes = Math.max(expiresInSeconds / 60, 1);
        return """
                <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
                  <h2 style="margin:0 0 12px">AURA Car Wash booking verification</h2>
                  <p>Your booking OTP is:</p>
                  <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">%s</div>
                  <p>Booking ID: <strong>%s</strong></p>
                  <p>This OTP expires in %d minutes and can only be used once.</p>
                  <p style="color:#64748b">If you did not create this booking, please ignore this email.</p>
                </div>
                """.formatted(otp, booking.getId(), minutes);
    }
}
