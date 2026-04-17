import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Price Fight" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error(`Nodemailer error: ${error}`);
  }
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  try {
    await sendEmail(
      to,
      'Xác nhận địa chỉ email của bạn',
      `
        <h2>Chào mừng bạn đến với Price Fight!</h2>
        <p>Vui lòng click vào đường link bên dưới để xác nhận tài khoản của bạn:</p>
        <a href="${verifyUrl}" target="_blank">Xác nhận Email</a>
        ${verifyUrl}
        <p>Link này sẽ hết hạn trong 24 giờ.</p>
      `
    );
  } catch (error: any) {
    console.error('Failed to send Verify email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

export const sendPasswordResetOTPEmail = async (to: string, otp: string) => {
  try {
    await sendEmail(
      to,
      'Mã OTP đặt lại mật khẩu của bạn',
      `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Price Fight.</p>
        <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #4CAF50; letter-spacing: 2px;">${otp}</b></p>
        <p>Mã này sẽ hết hạn trong vòng 15 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `
    );
  } catch (error: any) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};
