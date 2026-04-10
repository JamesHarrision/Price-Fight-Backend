import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/appError';

export class AuthController {
  private authService = new AuthService();

  public register = async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      throw new AppError(400, 'Vui lòng cung cấp đủ thông tin');
    }

    await this.authService.register({ email, password, full_name });

    return res.status(201).json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
    });
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError(400, 'Token không hợp lệ');
    }

    await this.authService.verifyEmail(token);

    return res.status(200).json({ message: 'Xác nhận email thành công. Bạn có thể đăng nhập!' });
  };

  public resendEmail = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    if (!email) throw new AppError(400, 'Vui lòng cung cấp email');

    await this.authService.resendVerificationEmail(email);

    return res.status(200).json({ message: 'Email xác nhận đã được gửi lại.' });
  };

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Vui lòng cung cấp email và mật khẩu');
    }

    const result = await this.authService.login({ email, password });

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      ...result,
    });
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new AppError(400, 'Vui lòng cung cấp email!');
    }

    await this.authService.forgotPassword(email);

    return res.status(200).json({
      message: 'Mã OTP đã được gửi đến email của bạn.',
    });
  };
  public resetPassword = async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      throw new AppError(400, 'Vui lòng cung cấp đủ email, mã OTP và mật khẩu mới.');
    }

    await this.authService.resetPassword({ email, otp, newPassword });

    return res.status(200).json({
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập',
    });
  };

  public refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, 'Vui lòng cung cấp Refresh Token');
    }

    const result = await this.authService.refreshToken(refreshToken);

    return res.status(200).json({
      message: 'Cấp lại Access Token thành công',
      accessToken: result.accessToken,
    });
  };

  public logout = async (req: Request, res: Response): Promise<any> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, 'Vui lòng cung cấp Refresh Token để đăng xuất');
    }
    await this.authService.logout(refreshToken);
    return res.status(200).json({ message: 'Đăng xuất thành công' });
  };
}
