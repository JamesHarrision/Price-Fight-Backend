"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const appError_1 = require("../utils/appError");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
        this.register = async (req, res) => {
            const { email, password, full_name } = req.body;
            if (!email || !password || !full_name) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp đủ thông tin');
            }
            await this.authService.register({ email, password, full_name });
            return res.status(201).json({
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
            });
        };
        this.verifyEmail = async (req, res) => {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                throw new appError_1.AppError(400, 'Token không hợp lệ');
            }
            await this.authService.verifyEmail(token);
            return res.status(200).json({ message: 'Xác nhận email thành công. Bạn có thể đăng nhập!' });
        };
        this.resendEmail = async (req, res) => {
            const { email } = req.body;
            if (!email)
                throw new appError_1.AppError(400, 'Vui lòng cung cấp email');
            await this.authService.resendVerificationEmail(email);
            return res.status(200).json({ message: 'Email xác nhận đã được gửi lại.' });
        };
        this.login = async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp email và mật khẩu');
            }
            const result = await this.authService.login({ email, password });
            return res.status(200).json({
                message: 'Đăng nhập thành công',
                ...result,
            });
        };
        this.forgotPassword = async (req, res) => {
            const { email } = req.body;
            if (!email) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp email!');
            }
            await this.authService.forgotPassword(email);
            return res.status(200).json({
                message: 'Mã OTP đã được gửi đến email của bạn.',
            });
        };
        this.resetPassword = async (req, res) => {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp đủ email, mã OTP và mật khẩu mới.');
            }
            await this.authService.resetPassword({ email, otp, newPassword });
            return res.status(200).json({
                message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập',
            });
        };
        this.refreshToken = async (req, res) => {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp Refresh Token');
            }
            const result = await this.authService.refreshToken(refreshToken);
            return res.status(200).json({
                message: 'Cấp lại Access Token thành công',
                accessToken: result.accessToken,
            });
        };
        this.logout = async (req, res) => {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp Refresh Token để đăng xuất');
            }
            await this.authService.logout(refreshToken);
            return res.status(200).json({ message: 'Đăng xuất thành công' });
        };
    }
}
exports.AuthController = AuthController;
