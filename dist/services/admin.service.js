"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_config_1 = require("../config/prisma.config");
const appError_1 = require("../utils/appError");
class AdminService {
    constructor() {
        this.getStats = async () => {
            const [totalRevenue, activeUsers, ongoingBids, liveItems] = await Promise.all([
                prisma_config_1.prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: { status: 'PAID' }
                }),
                prisma_config_1.prisma.user.count(),
                prisma_config_1.prisma.bidHistory.count(),
                prisma_config_1.prisma.auctionItem.count({
                    where: { status: 'LIVE' }
                })
            ]);
            return {
                totalRevenue: Number(totalRevenue._sum.amount || 0),
                activeUsers,
                ongoingBids,
                liveItems
            };
        };
        this.updateUser = async (userId, data) => {
            const user = await prisma_config_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.AppError(404, 'Người dùng không tồn tại');
            const updatedUser = await prisma_config_1.prisma.user.update({
                where: { id: userId },
                data: data
            });
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        };
    }
}
exports.AdminService = AdminService;
