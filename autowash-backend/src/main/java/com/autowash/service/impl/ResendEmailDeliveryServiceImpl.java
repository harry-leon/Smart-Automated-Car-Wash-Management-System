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

    private final Resend resend;
    private final String from;
    private final String fromName;
    private final String verifyRegisterOtpTemplateId;

    public ResendEmailDeliveryServiceImpl(
            @Value("${autowash.email.resend-api-key}") String apiKey,
            @Value("${autowash.email.from}") String from,
            @Value("${autowash.email.from-name:AURA Car Wash}") String fromName,
            @Value("${autowash.email.templates.verify-register-otp-id}") String verifyRegisterOtpTemplateId
    ) {
        this.resend = new Resend(apiKey);
        this.from = from;
        this.fromName = fromName;
        this.verifyRegisterOtpTemplateId = verifyRegisterOtpTemplateId;
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
                            .id(verifyRegisterOtpTemplateId)
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

    @Override
    public void sendPasswordResetOtp(String email, String fullName, String otp, int expiresInSeconds) {
        try {
            int minutes = Math.max(expiresInSeconds / 60, 1);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromName + " <" + from + ">")
                    .to(email)
                    .subject("AURA Car Wash - Password Reset OTP")
                    .html(passwordResetHtml(displayName(fullName), otp, minutes))
                    .text(passwordResetText(displayName(fullName), otp, minutes))
                    .build();
            CreateEmailResponse response = resend.emails().send(params);
            LOGGER.info("Password reset OTP sent: to={}, emailId={}", email, response.getId());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send password reset OTP via Resend", e);
        }
    }

    private String displayName(String fullName) {
        return fullName == null || fullName.isBlank() ? "there" : fullName;
    }

    private String passwordResetText(String fullName, String otp, int minutes) {
        return """
                Hello %s,

                Please use this OTP to reset your AURA Car Wash password: %s

                This OTP is valid for %d minutes and can only be used once.
                If you did not request this, please ignore this email or contact support.
                """.formatted(fullName, otp, minutes);
    }

    private String passwordResetHtml(String fullName, String otp, int minutes) {
        return """
                <!doctype html>
                <html>
                <body style="margin:0;padding:0;background:#f5f8fb;font-family:Arial,Helvetica,sans-serif;color:#071832;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f8fb;padding:32px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dce7f2;">
                          <tr>
                            <td style="background:#0f1b31;padding:36px 24px;text-align:center;border-bottom:4px solid #008bd2;">
                              <div style="font-size:36px;line-height:1;font-weight:800;letter-spacing:10px;color:#ffffff;text-shadow:0 0 18px rgba(0,139,210,.85);">AURA</div>
                              <div style="margin-top:16px;font-size:14px;letter-spacing:8px;color:#25b8f6;">PREMIUM AUTOWASH</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:36px 32px;">
                              <h1 style="margin:0 0 24px;font-size:28px;line-height:1.25;color:#06162f;">Password Reset</h1>
                              <p style="margin:0 0 18px;font-size:18px;line-height:1.6;color:#243957;">Hello <strong>%s</strong>,</p>
                              <p style="margin:0 0 28px;font-size:18px;line-height:1.6;color:#243957;">Please use the OTP below to reset your AURA Car Wash password:</p>
                              <div style="border:2px dashed #9fdcff;background:#eef9ff;border-radius:14px;padding:28px;text-align:center;margin:0 0 28px;">
                                <div style="font-size:14px;font-weight:700;letter-spacing:5px;color:#00649b;margin-bottom:18px;">OTP CODE</div>
                                <div style="font-family:Consolas,Monaco,monospace;font-size:44px;line-height:1;font-weight:700;letter-spacing:10px;color:#0082c7;">%s</div>
                              </div>
                              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#ff3232;">* This OTP is valid for <strong>%d</strong> minutes and can only be used once.</p>
                              <p style="margin:0;font-size:16px;line-height:1.6;color:#526783;">If you did not request this, please ignore this email or contact support.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px;text-align:center;background:#f4f8fc;border-top:1px solid #dce7f2;color:#6f7f99;">
                              <div style="font-weight:700;letter-spacing:2px;color:#526783;">AURA PREMIUM AUTOWASH</div>
                              <div style="margin-top:8px;font-size:14px;">Smart Automated Car Wash Management System</div>
                              <div style="margin-top:24px;font-size:13px;color:#aab6c8;">This is an automated message. Please do not reply directly to this email.</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(escapeHtml(fullName), escapeHtml(otp), minutes);
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
