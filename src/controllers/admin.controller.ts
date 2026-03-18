import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { AdminService } from '../services/admin.service';
import { prisma } from '../config/prisma.config';

export class AdminController {
  private jobService = new JobService();
  private adminService = new AdminService();

  // Get administrative stats for dashboard
  public getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.adminService.getStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        message: 'Lỗi server khi lấy thống kê',
        error: error.message,
      });
    }
  };

  // Update user roles and status by admin
  public updateUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const data = req.body;
      const updatedUser = await this.adminService.updateUser(userId as string, data);

      return res.status(200).json({
        message: 'Cập nhật người dùng thành công',
        data: updatedUser
      });
    } catch (error: any) {
      console.error(error);
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      return res.status(500).json({
        message: 'Lỗi server khi cập nhật người dùng',
        error: error.message,
      });
    }
  };

  // API Kích hoạt thủ công Job dọn dẹp Token
  public manualTriggerCleanupTokens = async (req: Request, res: Response) => {
    const deletedCount = await this.jobService.cleanupExpiredTokens();

    res.status(200).json({
      message: 'Kích hoạt dọn dẹp token thành công',
      deleted_count: deletedCount,
    });
  };

  // Get all transactions (admin view)
  public getAllTransactions = async (req: Request, res: Response) => {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: { select: { id: true, full_name: true, email: true } },
          item: {
            include: { event: { select: { id: true, title: true } } }
          }
        },
        orderBy: { created_at: 'desc' }
      });
      return res.status(200).json({ message: 'OK', data: transactions });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };
}
