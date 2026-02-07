package com.alice.education.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.from}")
    private String fromEmail;
    
    @Value("${app.url}")
    private String appUrl;
    
    @Async("taskExecutor")
    public void sendVerificationEmail(String toEmail, String token) throws MessagingException {
        String subject = "Xác thực tài khoản - Education AI";
        String verificationUrl = appUrl + "/api/auth/verify?token=" + token;
        
        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #333;'>Xác thực tài khoản</h2>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản tại Education AI!</p>" +
                "<p>Vui lòng nhấp vào liên kết bên dưới để xác thực email của bạn:</p>" +
                "<div style='margin: 30px 0;'>" +
                "<a href='" + verificationUrl + "' " +
                "style='background-color: #4CAF50; color: white; padding: 12px 30px; " +
                "text-decoration: none; border-radius: 4px; display: inline-block;'>" +
                "Xác thực email</a>" +
                "</div>" +
                "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                "<p style='color: #666; word-break: break-all;'>" + verificationUrl + "</p>" +
                "<p style='color: #999; font-size: 12px; margin-top: 30px;'>" +
                "Link này sẽ hết hạn sau 24 giờ.</p>" +
                "<p style='color: #999; font-size: 12px;'>" +
                "Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
        
        sendHtmlEmail(toEmail, subject, htmlContent);
    }
    
    @Async("taskExecutor")
    public void sendPasswordResetEmail(String toEmail, String token) throws MessagingException {
        String subject = "Đặt lại mật khẩu - Education AI";
        String resetUrl = appUrl + "/api/auth/reset-password?token=" + token;
        
        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #333;'>Đặt lại mật khẩu</h2>" +
                "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>" +
                "<p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>" +
                "<div style='margin: 30px 0;'>" +
                "<a href='" + resetUrl + "' " +
                "style='background-color: #2196F3; color: white; padding: 12px 30px; " +
                "text-decoration: none; border-radius: 4px; display: inline-block;'>" +
                "Đặt lại mật khẩu</a>" +
                "</div>" +
                "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                "<p style='color: #666; word-break: break-all;'>" + resetUrl + "</p>" +
                "<p style='color: #999; font-size: 12px; margin-top: 30px;'>" +
                "Link này sẽ hết hạn sau 1 giờ.</p>" +
                "<p style='color: #999; font-size: 12px;'>" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
        
        sendHtmlEmail(toEmail, subject, htmlContent);
    }
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true indicates html
        
        mailSender.send(message);
    }
}
