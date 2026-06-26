package com.autowash.service.impl;

import com.autowash.service.EmailDeliveryService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "smtp")
public class SmtpEmailDeliveryServiceImpl implements EmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpEmailDeliveryServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;

    public SmtpEmailDeliveryServiceImpl(
            JavaMailSender mailSender,
            @Value("${autowash.email.from}") String from,
            @Value("${autowash.email.from-name:AURA Car Wash}") String fromName
    ) {
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, fromName);
            helper.setTo(email);
            helper.setSubject("AURA Car Wash email verification OTP");
            helper.setText(textBody(fullName, otp, expiresInSeconds), htmlBody(fullName, otp, expiresInSeconds));
            mailSender.send(message);
        } catch (Exception exception) {
            LOGGER.error("Failed to send registration OTP email to {}", email, exception);
            throw new IllegalStateException("Unable to send registration OTP email", exception);
        }
    }

    private String textBody(String fullName, String otp, int expiresInSeconds) {
        int minutes = Math.max(expiresInSeconds / 60, 1);
        return """
                Hello %s,

                Your AURA Car Wash email verification OTP is %s.

                This OTP expires in %d minutes and can only be used once.
                If you did not register this account, please ignore this email.
                """.formatted(displayName(fullName), otp, minutes);
    }

    private String htmlBody(String fullName, String otp, int expiresInSeconds) {
        int minutes = Math.max(expiresInSeconds / 60, 1);
        return """
                <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
                  <h2 style="margin:0 0 12px">AURA Car Wash email verification</h2>
                  <p>Hello %s,</p>
                  <p>Your email verification OTP is:</p>
                  <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">%s</div>
                  <p>This OTP expires in %d minutes and can only be used once.</p>
                  <p style="color:#64748b">If you did not register this account, please ignore this email.</p>
                </div>
                """.formatted(displayName(fullName), otp, minutes);
    }

    private String displayName(String fullName) {
        return fullName == null || fullName.isBlank() ? "there" : fullName;
    }
}
