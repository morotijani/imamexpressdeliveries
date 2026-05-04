import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.MAIL_PORT || '587'),
  auth: {
    user: process.env.MAIL_USER || 'your_user',
    pass: process.env.MAIL_PASS || 'your_pass',
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Imam Express" <${process.env.MAIL_FROM || 'no-reply@imamexpress.com'}>`,
    to: email,
    subject: 'Verify Your Email - Imam Express',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #A020F0; text-align: center;">Welcome to Imam Express!</h2>
        <p>Thank you for creating an account. To complete your registration and start using our premium delivery services, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #A020F0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 0.9rem; color: #666; text-align: center;"><strong>Note:</strong> This link will expire in 15 minutes.</p>
        <p style="font-size: 0.9rem; color: #666;">If you didn't create an account with Imam Express, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 0.8rem; color: #999; text-align: center;">&copy; 2026 Imam Express Deliveries. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    if (process.env.MAIL_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
