"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const appError_1 = require("../utils/appError");
class UserService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
        this.getMe = async (userId) => {
            const user = await this.userRepo.getUserById(userId);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy người dùng');
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        };
        this.updateMe = async (userId, data) => {
            const user = await this.userRepo.getUserById(userId);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy người dùng');
            if (user.avatar_url && data.avatar_url) {
                await (0, cloudinary_util_1.deleteImageFromCloudinary)(user.avatar_url);
            }
            const updatedUser = await this.userRepo.updateUser(userId, data);
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        };
        this.deposit = async (userId, amount) => {
            if (amount <= 0) {
                throw new appError_1.AppError(400, 'Số tiền nạp phải lớn hơn 0');
            }
            const user = await this.userRepo.getUserById(userId);
            if (!user)
                throw new appError_1.AppError(404, 'Không tìm thấy người dùng');
            const newBalance = Number(user.balance) + amount;
            const updatedUser = await this.userRepo.updateUser(userId, { balance: newBalance });
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        };
        this.getAllUsers = async (page = 1, limit = 10, search) => {
            const skip = (page - 1) * limit;
            const { users, total } = await this.userRepo.getAllUsers(skip, limit, search);
            return {
                data: users.map(({ password, ...rest }) => rest),
                pagination: {
                    total_items: total,
                    total_pages: Math.ceil(total / limit),
                    current_page: page,
                    limit: limit,
                },
            };
        };
        // --- Address Business Logic ---
        this.getAddresses = async (userId) => {
            return await this.userRepo.getAddressesByUserId(userId);
        };
        this.addAddress = async (userId, data) => {
            const existingAddresses = await this.userRepo.getAddressesByUserId(userId);
            const isFirst = existingAddresses.length === 0;
            return await this.userRepo.createAddress({
                ...data,
                user_id: userId,
                is_default: data.is_default !== undefined ? data.is_default : isFirst,
            });
        };
        this.deleteAddress = async (userId, addressId) => {
            const address = await this.userRepo.getAddressById(addressId);
            if (!address)
                throw new appError_1.AppError(404, 'Không tìm thấy địa chỉ');
            if (address.user_id !== userId)
                throw new appError_1.AppError(403, 'Bạn không có quyền xóa địa chỉ này');
            await this.userRepo.deleteAddress(addressId);
            return { message: 'Xóa địa chỉ thành công' };
        };
        // --- Bids Business Logic ---
        this.getMyBids = async (userId) => {
            return await this.userRepo.getMyBids(userId);
        };
    }
}
exports.UserService = UserService;
