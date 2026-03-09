import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";


export class AuthController {

  private authService = new AuthService();

  public register = async (req: Request, res: Response) => {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
      }

      await this.authService.register({ email, password, full_name });

      return res.status(201).json({
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      if (error.message === 'EMAIL_SEND_FAILED') {
        return res.status(500).json({ message: 'Không thể gửi email xác nhận. Vui lòng thử đăng ký lại sau.' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
  }

  public verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Token không hợp lệ' });
      }

      await this.authService.verifyEmail(token);

      return res.status(200).json({ message: 'Xác nhận email thành công. Bạn có thể đăng nhập!' });
    } catch (error: any) {
      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json({ message: 'Token không tồn tại hoặc sai loại' });
      }
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(400).json({ message: 'Token đã hết hạn' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
  }

  public resendEmail = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

      await this.authService.resendVerificationEmail(email);

      return res.status(200).json({ message: 'Email xác nhận đã được gửi lại.' });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản này' });
      }
      if (error.message === 'ALREADY_VERIFIED') {
        return res.status(400).json({ message: 'Tài khoản này đã được xác nhận từ trước' });
      }
      if (error.message === 'EMAIL_SEND_FAILED') {
        return res.status(500).json({ message: 'Lỗi hệ thống gửi mail. Vui lòng thử lại sau.' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
      }

      const result = await this.authService.login({ email, password });

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        ...result
      });

    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
        return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        return res.status(403).json({ message: 'Vui lòng xác nhận email trước khi đăng nhập' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
  }
}
