"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const token_repository_1 = require("../repositories/token.repository");
const password_util_1 = require("../utils/password.util");
const token_util_1 = require("../utils/token.util");
const mailer_util_1 = require("../utils/mailer.util");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const day_util_1 = require("../utils/day.util");
const appError_1 = require("../utils/appError");
class AuthService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
        this.tokenRepo = new token_repository_1.TokenRepository();
        this.register = async (data) => {
            const { email, password, full_name } = data;
            const existingUser = await this.userRepo.getUserByEmail(email);
            if (existingUser)
                throw new appError_1.AppError(400, 'Email đã được sử dụng');
            const hashedPassword = await password_util_1.passwordUtil.hash(password);
            const user = await this.userRepo.createUser({
                email: email,
                password: hashedPassword,
                full_name: full_name,
                balance: 0,
            });
            const verificationToken = token_util_1.tokenUtil.generateToken();
            await this.tokenRepo.create({
                token: verificationToken,
                type: client_1.TokenType.VERIFICATION,
                expires_at: token_util_1.tokenUtil.getExpiresAt('minutes', 15),
                user_id: user.id,
            });
            try {
                await (0, mailer_util_1.sendVerificationEmail)(user.email, verificationToken);
            }
            catch (error) {
                await this.userRepo.deleteUser(user.id);
                console.error('Lỗi gửi mail, đã xoá user:', error);
                throw new appError_1.AppError(500, 'Không thể gửi email xác nhận. Vui lòng thử đăng ký lại sau.');
            }
            return user;
        };
        this.verifyEmail = async (token) => {
            const tokenRecord = await this.tokenRepo.findByToken(token);
            if (!tokenRecord || tokenRecord.type !== client_1.TokenType.VERIFICATION) {
                throw new appError_1.AppError(400, 'Token không tồn tại hoặc sai loại');
            }
            if (tokenRecord.expires_at < (0, day_util_1.getDate)()) {
                throw new appError_1.AppError(400, 'Token đã hết hạn');
            }
            await this.userRepo.updateVerificationStatus(tokenRecord.user_id, true);
            await this.tokenRepo.delete(tokenRecord.id);
            return true;
        };
        this.resendVerificationEmail = async (email) => {
            const user = await this.userRepo.getUserByEmail(email);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy tài khoản này');
            if (user.is_verified)
                throw new appError_1.AppError(400, 'Tài khoản này đã được xác nhận từ trước');
            // Tạo token mới
            const verificationToken = token_util_1.tokenUtil.generateToken();
            const expiresAt = (0, day_util_1.getDate)();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.tokenRepo.create({
                token: verificationToken,
                type: 'VERIFICATION',
                expires_at: expiresAt,
                user_id: user.id,
            });
            try {
                await (0, mailer_util_1.sendVerificationEmail)(user.email, verificationToken);
            }
            catch (error) {
                console.error('Lỗi gửi mail:', error);
                throw new appError_1.AppError(500, 'Lỗi hệ thống gửi mail. Vui lòng thử lại sau.');
            }
            return true;
        };
        this.login = async (data) => {
            const { email, password } = data;
            const user = await this.userRepo.getUserByEmail(email);
            if (!user)
                throw new appError_1.AppError(400, 'Email hoặc mật khẩu không chính xác');
            const isMatch = await password_util_1.passwordUtil.compare(password, user.password);
            if (!isMatch)
                throw new appError_1.AppError(400, 'Email hoặc mật khẩu không chính xác');
            if (!user.is_verified)
                throw new appError_1.AppError(403, 'Vui lòng xác nhận email trước khi đăng nhập');
            const accessToken = token_util_1.tokenUtil.signAccessToken({ id: user.id, role: user.role });
            const refreshToken = token_util_1.tokenUtil.signRefreshToken({ id: user.id });
            await this.tokenRepo.create({
                token: refreshToken,
                type: client_1.TokenType.REFRESH,
                expires_at: token_util_1.tokenUtil.getExpiresAt('days', 7),
                user_id: user.id,
            });
            return {
                accessToken,
                refreshToken,
                user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            };
        };
        this.forgotPassword = async (email) => {
            const user = await this.userRepo.getUserByEmail(email);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy tài khoản với email này.');
            const otp = token_util_1.tokenUtil.generateOTP();
            await this.tokenRepo.create({
                token: otp,
                type: client_1.TokenType.RESET_PASSWORD,
                expires_at: token_util_1.tokenUtil.getExpiresAt('minutes', 15),
                user_id: user.id,
            });
            try {
                await (0, mailer_util_1.sendPasswordResetOTPEmail)(user.email, otp);
            }
            catch (error) {
                console.error('Lỗi gửi mail OTP: ', error);
                throw new appError_1.AppError(500, 'Lỗi hệ thống gửi mail. Vui lòng thử lại sau.');
            }
            return true;
        };
        this.resetPassword = async (data) => {
            const { email, otp, newPassword } = data;
            const user = await this.userRepo.getUserByEmail(email);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy tài khoản.');
            const tokenRecord = await this.tokenRepo.findValidOTP(user.id, otp, client_1.TokenType.RESET_PASSWORD);
            if (!tokenRecord) {
                throw new appError_1.AppError(404, 'Mã OTP không hợp lệ hoặc không đúng.');
            }
            if (tokenRecord.expires_at < (0, day_util_1.getDate)()) {
                await this.tokenRepo.delete(tokenRecord.id);
                throw new appError_1.AppError(400, 'Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu.');
            }
            const hashedPassword = await password_util_1.passwordUtil.hash(newPassword);
            await this.userRepo.updatePassword(user.id, hashedPassword);
            await this.tokenRepo.delete(tokenRecord.id);
            return true;
        };
        this.refreshToken = async (refreshToken) => {
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
                if (!tokenRecord || tokenRecord.type !== client_1.TokenType.REFRESH) {
                    throw new appError_1.AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn.');
                }
                const user = await this.userRepo.getUserById(tokenRecord.user_id);
                if (!user)
                    throw new appError_1.AppError(404, 'Không tìm thấy tài khoản');
                const newAccessToken = token_util_1.tokenUtil.signAccessToken({ id: user.id, role: user.role });
                return { accessToken: newAccessToken };
            }
            catch (error) {
                throw new appError_1.AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
            }
        };
        this.logout = async (refreshToken) => {
            const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
            if (!tokenRecord || tokenRecord.type !== 'REFRESH') {
                throw new appError_1.AppError(404, 'Không tìm thấy token');
            }
            await this.tokenRepo.delete(tokenRecord.id);
        };
    }
}
exports.AuthService = AuthService;
