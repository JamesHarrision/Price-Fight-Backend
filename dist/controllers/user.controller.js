"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const appError_1 = require("../utils/appError");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        this.getMe = async (req, res) => {
            const userId = req.user.id;
            const user = await this.userService.getMe(userId);
            return res.status(200).json({ data: user });
        };
        this.updateMe = async (req, res) => {
            const userId = req.user.id;
            const { full_name } = req.body;
            let avatar_url;
            // Nếu có upload file từ Cloudinary
            if (req.file) {
                avatar_url = req.file.path;
            }
            const updateData = {};
            if (full_name)
                updateData.full_name = full_name;
            if (avatar_url)
                updateData.avatar_url = avatar_url;
            const updatedUser = await this.userService.updateMe(userId, updateData);
            return res.status(200).json({
                message: 'Cập nhật thông tin cá nhân thành công',
                data: updatedUser,
            });
        };
        this.getAllUsers = async (req, res) => {
            const { page, limit, search } = req.query;
            const result = await this.userService.getAllUsers(Number(page || 1), Number(limit || 10), search);
            return res.status(200).json(result);
        };
        this.deposit = async (req, res) => {
            const userId = req.user.id;
            const { amount } = req.body;
            if (!amount || isNaN(Number(amount))) {
                throw new appError_1.AppError(400, 'Số tiền nạp không hợp lệ');
            }
            const updatedUser = await this.userService.deposit(userId, Number(amount));
            return res.status(200).json({
                message: 'Nạp tiền vào ví thành công',
                balance: updatedUser.balance,
            });
        };
        // --- Address Endpoints ---
        this.getAddresses = async (req, res) => {
            const userId = req.user.id;
            const addresses = await this.userService.getAddresses(userId);
            return res.status(200).json({ data: addresses });
        };
        this.addAddress = async (req, res) => {
            const userId = req.user.id;
            const { phone, street, city, is_default } = req.body;
            if (!phone || !street || !city) {
                throw new appError_1.AppError(400, 'Vui lòng cung cấp đầy đủ phone, street, city');
            }
            const newAddress = await this.userService.addAddress(userId, { phone, street, city, is_default });
            return res.status(201).json({
                message: 'Thêm địa chỉ thành công',
                data: newAddress
            });
        };
        this.deleteAddress = async (req, res) => {
            const userId = req.user.id;
            const { id } = req.params;
            const result = await this.userService.deleteAddress(userId, id);
            return res.status(200).json(result);
        };
        // --- Bids Endpoints ---
        this.getMyBids = async (req, res) => {
            const userId = req.user.id;
            const bids = await this.userService.getMyBids(userId);
            return res.status(200).json({ data: bids });
        };
    }
}
exports.UserController = UserController;
