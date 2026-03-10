import { UserRepository } from "../repositories/user.repository";
import { TokenRepository } from "../repositories/token.repository";

import { passwordUtil } from "../utils/password.util";
import { tokenUtil } from "../utils/token.util";

import { sendVerificationEmail } from "../utils/mailer.util";
import { Role, TokenType } from "@prisma/client";

import jwt from 'jsonwebtoken'

export class AuthService {

  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  public register = async (data: any) => {
    const { email, password, full_name } = data;

    const existingUser = await this.userRepo.getUserByEmail(email);
    if (existingUser) throw new Error("EMAIL_EXISTS");

    const hashedPassword = await passwordUtil.hash(password);

    const user = await this.userRepo.createUser({
      email: email,
      password: hashedPassword,
      full_name: full_name,
      balance: 0
    });

    const verificationToken = tokenUtil.generateToken();

    await this.tokenRepo.create({
      token: verificationToken,
      type: TokenType.VERIFICATION,
      expires_at: tokenUtil.getExpiresAt('minutes', 15),
      user_id: user.id
    })

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (error: any) {
      await this.userRepo.deleteUser(user.id);
      console.error("Lỗi gửi mail, đã xoá user:", error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return user;
  }

  public verifyEmail = async (token: string) => {
    const tokenRecord = await this.tokenRepo.findByToken(token);
    if (!tokenRecord || tokenRecord.type !== TokenType.VERIFICATION) {
      throw new Error("INVALID_TOKEN");
    }

    if (tokenRecord.expires_at < new Date()) {
      throw new Error("TOKEN_EXPIRED");
    }

    await this.userRepo.updateVerificationStatus(tokenRecord.user_id, true);
    await this.tokenRepo.delete(tokenRecord.id);

    return true;
  }

  public resendVerificationEmail = async (email: string) => {
    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.is_verified) throw new Error('ALREADY_VERIFIED');

    // Tạo token mới
    const verificationToken = tokenUtil.generateToken();
    const expiresAt = new Date();
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
      console.error("Lỗi gửi mail:", error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return true;
  }

  public login = async (data: any) => {
    const { email, password } = data;

    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new Error('USER_NOT_FOUND');

    const isMatch = await passwordUtil.compare(password, user.password);
    if (!isMatch) throw new Error('INVALID_PASSWORD');

    if (!user.is_verified) throw new Error('EMAIL_NOT_VERIFIED');

    const accessToken = tokenUtil.signAccessToken({ id: user.id, role: user.role });
    const refreshToken = tokenUtil.signRefreshToken({ id: user.id });

    await this.tokenRepo.create({
      token: refreshToken,
      type: TokenType.REFRESH,
      expires_at: tokenUtil.getExpiresAt('days', 7),
      user_id: user.id
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    };
  }

  // Cấp lại Access Token mới
  public refreshToken = async (refreshToken: string) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

      const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
      if (!tokenRecord || tokenRecord.type !== TokenType.REFRESH) {
        throw new Error('INVALID_TOKEN');
      }

      const user = await this.userRepo.getUserById(tokenRecord.user_id);
      if (!user) throw new Error('USER_NOT_FOUND');

      const newAccessToken = tokenUtil.signAccessToken(
        { id: user.id, role: user.role }
      )
      return { accessToken: newAccessToken };
    } catch (error: any) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }
  }

  public logout = async (refreshToken: string) => {
    const tokenRecord = await this.tokenRepo.findByToken(refreshToken);

    if (!tokenRecord || tokenRecord.type !== 'REFRESH') {
      throw new Error('TOKEN_NOT_FOUND'); // <-- Bắt lỗi tại đây
    }

    await this.tokenRepo.delete(tokenRecord.id);
  }
}