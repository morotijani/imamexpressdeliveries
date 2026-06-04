"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.MAIL_PORT || '587'),
    auth: {
        user: process.env.MAIL_USER || 'your_user',
        pass: process.env.MAIL_PASS || 'your_pass',
    },
});
const emailTemplate = (title, preheader, content, ctaLink, ctaText, footerNote) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #a020f0 0%, #7c12bd 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; font-size: 16px; }
    .content h2 { color: #18181b; font-size: 22px; font-weight: 700; margin-top: 0; }
    .cta-container { text-align: center; margin: 35px 0; }
    .cta-button { display: inline-block; background-color: #a020f0; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
    .footer { background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7; }
    .footer p { margin: 0 0 10px 0; color: #71717a; font-size: 14px; }
    .note { font-size: 14px; color: #71717a; text-align: center; background: #f4f4f5; padding: 15px; border-radius: 8px; margin-top: 30px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1>ImamExpress</h1>
    </div>
    <div class="content">
      ${content}
      <div class="cta-container">
        <a href="${ctaLink}" class="cta-button">${ctaText}</a>
      </div>
      <div class="note">
        ${footerNote}
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Imam Express Deliveries. All rights reserved.</p>
      <p style="font-size: 12px;">14 Independence Avenue, Accra Central, Ghana</p>
    </div>
  </div>
</body>
</html>
`;
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const content = `
    <h2>Welcome to Imam Express! 👋</h2>
    <p>We're thrilled to have you on board. To complete your registration and start experiencing premium hyper-local delivery services, we just need to verify your email address.</p>
  `;
    const html = emailTemplate('Verify Your Email', 'Action required: Verify your email address to complete your Imam Express registration.', content, verificationLink, 'Verify Email Address', '<strong>Security Note:</strong> This verification link will expire in 15 minutes. If you did not create an account, you can safely ignore this email.');
    const mailOptions = {
        from: `"Imam Express" <${process.env.MAIL_FROM || 'no-reply@imamexpress.com'}>`,
        to: email,
        subject: 'Verify Your Email - Imam Express',
        html,
    };
    try {
        const info = await exports.transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        if (process.env.MAIL_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const content = `
    <h2>Password Reset Request 🔒</h2>
    <p>We received a request to reset the password for your Imam Express account. If you made this request, please click the button below to choose a new password.</p>
  `;
    const html = emailTemplate('Reset Your Password', 'Action required: Reset your Imam Express password.', content, resetLink, 'Reset Password', '<strong>Security Note:</strong> This reset link will expire in 15 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.');
    const mailOptions = {
        from: `"Imam Express Security" <${process.env.MAIL_FROM || 'no-reply@imamexpress.com'}>`,
        to: email,
        subject: 'Password Reset Request - Imam Express',
        html,
    };
    try {
        const info = await exports.transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        if (process.env.MAIL_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedEmail = async (email) => {
    const loginLink = `${process.env.FRONTEND_URL}/login`;
    const content = `
    <h2>Password Successfully Changed 🎉</h2>
    <p>This is a confirmation that the password for your Imam Express account has just been changed.</p>
    <p>If you made this change, you don't need to do anything else. You can log in using your new password.</p>
  `;
    const html = emailTemplate('Password Changed', 'Your Imam Express account password has been updated.', content, loginLink, 'Log In Now', '<strong>Security Note:</strong> If you did not make this change, please contact our support team immediately to secure your account.');
    const mailOptions = {
        from: `"Imam Express Security" <${process.env.MAIL_FROM || 'no-reply@imamexpress.com'}>`,
        to: email,
        subject: 'Password Changed - Imam Express',
        html,
    };
    try {
        const info = await exports.transporter.sendMail(mailOptions);
        console.log('Password changed email sent:', info.messageId);
        if (process.env.MAIL_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
    }
    catch (error) {
        console.error('Error sending password changed email:', error);
        throw new Error('Failed to send password changed email');
    }
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
