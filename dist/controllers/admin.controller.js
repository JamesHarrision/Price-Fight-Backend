"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const job_service_1 = require("../services/job.service");
const admin_service_1 = require("../services/admin.service");
const prisma_config_1 = require("../config/prisma.config");
class AdminController {
    constructor() {
        this.jobService = new job_service_1.JobService();
        this.adminService = new admin_service_1.AdminService();
        // Get administrative stats for dashboard
        this.getStats = async (req, res) => {
            const stats = await this.adminService.getStats();
            return res.status(200).json(stats);
        };
        // Update user roles and status by admin
        this.updateUser = async (req, res) => {
            const { userId } = req.params;
            const data = req.body;
            const updatedUser = await this.adminService.updateUser(userId, data);
            return res.status(200).json({
                message: 'Cập nhật người dùng thành công',
                data: updatedUser
            });
        };
        // API Kích hoạt thủ công Job dọn dẹp Token
        this.manualTriggerCleanupTokens = async (req, res) => {
            const deletedCount = await this.jobService.cleanupExpiredTokens();
            res.status(200).json({
                message: 'Kích hoạt dọn dẹp token thành công',
                deleted_count: deletedCount,
            });
        };
        // Get all transactions (admin view)
        this.getAllTransactions = async (req, res) => {
            const transactions = await prisma_config_1.prisma.transaction.findMany({
                include: {
                    user: { select: { id: true, full_name: true, email: true } },
                    item: {
                        include: { event: { select: { id: true, title: true } } }
                    }
                },
                orderBy: { created_at: 'desc' }
            });
            return res.status(200).json({ message: 'OK', data: transactions });
        };
    }
}
exports.AdminController = AdminController;
