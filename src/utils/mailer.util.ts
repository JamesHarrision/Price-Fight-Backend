import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Price Fight" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác nhận địa chỉ email của bạn',
    html: `
      <h2>Chào mừng bạn đến với Price Fight!</h2>
      <p>Vui lòng click vào đường link bên dưới để xác nhận tài khoản của bạn:</p>
      <a href="${verifyUrl}" target="_blank">Xác nhận Email</a>
      <p>Link này sẽ hết hạn trong 24 giờ.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}