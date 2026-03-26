import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const EMAIL_USER = process.env.EMAIL_USER!;

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Price Fight', email: EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo error: ${JSON.stringify(error)}`);
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
