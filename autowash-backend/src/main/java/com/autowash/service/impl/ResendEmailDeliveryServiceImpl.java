package com.autowash.service.impl;

import com.autowash.service.EmailDeliveryService;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.resend.services.emails.model.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "autowash.email", name = "provider", havingValue = "resend")
public class ResendEmailDeliveryServiceImpl implements EmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResendEmailDeliveryServiceImpl.class);
    private static final String VERIFY_REGISTER_OTP_TEMPLATE_ID = "19694ae4-8fb6-4173-b69e-5046b2da2b77";

    private final Resend resend;
    private final String from;
    private final String fromName;

    public ResendEmailDeliveryServiceImpl(
            @Value("${autowash.email.resend-api-key}") String apiKey,
            @Value("${autowash.email.from}") String from,
            @Value("${autowash.email.from-name:AURA Car Wash}") String fromName
    ) {
        this.resend = new Resend(apiKey);
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void sendRegistrationOtp(String email, String fullName, String otp, int expiresInSeconds) {
        try {
            int minutes = Math.max(expiresInSeconds / 60, 1);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromName + " <" + from + ">")
                    .to(email)
                    .subject("AURA Car Wash - Email Verification")
                    .template(Template.builder()
                            .id(VERIFY_REGISTER_OTP_TEMPLATE_ID)
                            .addVariable("fullName", displayName(fullName))
                            .addVariable("otp", otp)
                            .addVariable("minutes", String.valueOf(minutes))
                            .build())
                    .build();
            CreateEmailResponse response = resend.emails().send(params);
            LOGGER.info("Registration OTP sent: to={}, emailId={}", email, response.getId());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send registration OTP via Resend", e);
        }
    }

    private String displayName(String fullName) {
        return fullName == null || fullName.isBlank() ? "there" : fullName;
    }
}
