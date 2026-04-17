"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_config_1 = require("../config/prisma.config");
class UserRepository {
    constructor() {
        this.getUserByEmail = async (email) => {
            return await prisma_config_1.prisma.user.findUnique({
                where: { email: email },
            });
        };
        this.getUserById = async (id) => {
            return await prisma_config_1.prisma.user.findUnique({
                where: { id: id },
            });
        };
        this.createUser = async (data) => {
            return await prisma_config_1.prisma.user.create({ data });
        };
        this.deleteUser = async (id) => {
            return await prisma_config_1.prisma.user.delete({
                where: { id: id },
            });
        };
        this.updateVerificationStatus = async (userId, isVerified) => {
            return await prisma_config_1.prisma.user.update({
                where: { id: userId },
                data: {
                    is_verified: isVerified,
                },
            });
        };
        this.updatePassword = async (userId, hashedNewPassword) => {
            return await prisma_config_1.prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedNewPassword,
                },
            });
        };
        this.updateUser = async (userId, data) => {
            return await prisma_config_1.prisma.user.update({
                where: { id: userId },
                data: data
            });
        };
        this.getAllUsers = async (skip = 0, take = 10, search) => {
            const whereCondition = {};
            if (search) {
                whereCondition.OR = [
                    { full_name: { contains: search } },
                    { email: { contains: search } }
                ];
            }
            const [users, total] = await Promise.all([
                prisma_config_1.prisma.user.findMany({
                    where: whereCondition,
                    skip,
                    take,
                    orderBy: { full_name: 'asc' }
                }),
                prisma_config_1.prisma.user.count({ where: whereCondition })
            ]);
            return { users, total };
        };
        // --- Address Management ---
        this.getAddressesByUserId = async (userId) => {
            return await prisma_config_1.prisma.address.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
            });
        };
        this.createAddress = async (data) => {
            return await prisma_config_1.prisma.address.create({ data });
        };
        this.getAddressById = async (addressId) => {
            return await prisma_config_1.prisma.address.findUnique({
                where: { id: addressId },
            });
        };
        this.deleteAddress = async (addressId) => {
            return await prisma_config_1.prisma.address.delete({
                where: { id: addressId },
            });
        };
        // --- Bids Management ---
        this.getMyBids = async (userId) => {
            // Lấy danh sách các vật phẩm mà user đã từng đặt giá, kèm theo thông tin của phòng đấu giá 
            // và mức giá cao nhất mà CHÍNH USER ĐÓ đã đặt.
            return await prisma_config_1.prisma.auctionItem.findMany({
                where: {
                    bids: {
                        some: { user_id: userId }
                    }
                },
                include: {
                    event: true,
                    bids: {
                        where: { user_id: userId },
                        orderBy: { amount: 'desc' },
                        take: 1
                    }
                },
                orderBy: {
                    id: 'desc'
                }
            });
        };
    }
}
exports.UserRepository = UserRepository;
