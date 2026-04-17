import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';

import { passwordUtil } from '../utils/password.util';
import { tokenUtil } from '../utils/token.util';

import { sendVerificationEmail, sendPasswordResetOTPEmail } from '../utils/mailer.util';
import { Role, TokenType } from '@prisma/client';

import jwt from 'jsonwebtoken';
import { getDate } from '../utils/day.util';

import { AppError } from '../utils/appError';

export class AuthService {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  public register = async (data: any) => {
    const { email, password, full_name } = data;

    const existingUser = await this.userRepo.getUserByEmail(email);
    if (existingUser) throw new AppError(400, 'Email đã được sử dụng');

    const hashedPassword = await passwordUtil.hash(password);

    const user = await this.userRepo.createUser({
      email: email,
      password: hashedPassword,
      full_name: full_name,
      balance: 0,
    });

    const verificationToken = tokenUtil.generateToken();

    await this.tokenRepo.create({
      token: verificationToken,
      type: TokenType.VERIFICATION,
      expires_at: tokenUtil.getExpiresAt('minutes', 15),
      user_id: user.id,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (error: any) {
      await this.userRepo.deleteUser(user.id);
      console.error('Lỗi gửi mail, đã xoá user:', error);
      throw new AppError(500, 'Không thể gửi email xác nhận. Vui lòng thử đăng ký lại sau.');
    }

    return user;
  };

  public verifyEmail = async (token: string) => {
    const tokenRecord = await this.tokenRepo.findByToken(token);
    if (!tokenRecord || tokenRecord.type !== TokenType.VERIFICATION) {
      throw new AppError(400, 'Token không tồn tại hoặc sai loại');
    }

    if (tokenRecord.expires_at < getDate()) {
      throw new AppError(400, 'Token đã hết hạn');
    }

    await this.userRepo.updateVerificationStatus(tokenRecord.user_id, true);
    await this.tokenRepo.delete(tokenRecord.id);

    return true;
  };

  public resendVerificationEmail = async (email: string) => {
    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new AppError(404, 'Không tìm thấy tài khoản này');
    if (user.is_verified) throw new AppError(400, 'Tài khoản này đã được xác nhận từ trước');

    // Tạo token mới
    const verificationToken = tokenUtil.generateToken();
    const expiresAt = getDate();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.tokenRepo.create({
      token: verificationToken,
      type: 'VERIFICATION',
      expires_at: expiresAt,
      user_id: user.id,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Lỗi gửi mail:', error);
      throw new AppError(500, 'Lỗi hệ thống gửi mail. Vui lòng thử lại sau.');
    }

    return true;
  };

  public login = async (data: any) => {
    const { email, password } = data;

    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new AppError(400, 'Email hoặc mật khẩu không chính xác');

    const isMatch = await passwordUtil.compare(password, user.password);
    if (!isMatch) throw new AppError(400, 'Email hoặc mật khẩu không chính xác');

    if (!user.is_verified) throw new AppError(403, 'Vui lòng xác nhận email trước khi đăng nhập');

    const accessToken = tokenUtil.signAccessToken({ id: user.id, role: user.role });
    const refreshToken = tokenUtil.signRefreshToken({ id: user.id });

    await this.tokenRepo.create({
      token: refreshToken,
      type: TokenType.REFRESH,
      expires_at: tokenUtil.getExpiresAt('days', 7),
      user_id: user.id,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    };
  };

  public forgotPassword = async (email: string) => {
    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new AppError(404, 'Không tìm thấy tài khoản với email này.');

    const otp = tokenUtil.generateOTP();

    await this.tokenRepo.create({
      token: otp,
      type: TokenType.RESET_PASSWORD,
      expires_at: tokenUtil.getExpiresAt('minutes', 15),
      user_id: user.id,
    });

    try {
      await sendPasswordResetOTPEmail(user.email, otp);
    } catch (error) {
      console.error('Lỗi gửi mail OTP: ', error);
      throw new AppError(500, 'Lỗi hệ thống gửi mail. Vui lòng thử lại sau.');
    }

    return true;
  };

  public resetPassword = async (data: any) => {
    const { email, otp, newPassword } = data;

    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new AppError(404, 'Không tìm thấy tài khoản.');

    const tokenRecord = await this.tokenRepo.findValidOTP(user.id, otp, TokenType.RESET_PASSWORD);
    if (!tokenRecord) {
      throw new AppError(404, 'Mã OTP không hợp lệ hoặc không đúng.');
    }

    if (tokenRecord.expires_at < getDate()) {
      await this.tokenRepo.delete(tokenRecord.id);
      throw new AppError(400, 'Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu.');
    }

    const hashedPassword = await passwordUtil.hash(newPassword);
    await this.userRepo.updatePassword(user.id, hashedPassword);

    await this.tokenRepo.delete(tokenRecord.id);

    return true;
  };

  public refreshToken = async (refreshToken: string) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

      const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
      if (!tokenRecord || tokenRecord.type !== TokenType.REFRESH) {
        throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn.');
      }

      const user = await this.userRepo.getUserById(tokenRecord.user_id);
      if (!user) throw new AppError(404, 'Không tìm thấy tài khoản');

      const newAccessToken = tokenUtil.signAccessToken({ id: user.id, role: user.role });
      return { accessToken: newAccessToken };
    } catch (error: any) {
      throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }
  };

  public logout = async (refreshToken: string) => {
    const tokenRecord = await this.tokenRepo.findByToken(refreshToken);

    if (!tokenRecord || tokenRecord.type !== 'REFRESH') {
      throw new AppError(404, 'Không tìm thấy token');
    }

    await this.tokenRepo.delete(tokenRecord.id);
  };
}
