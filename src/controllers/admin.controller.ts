import { Request, Response } from 'express';
import { JobService } from '../services/job.service';

export class AdminController {
  private jobService = new JobService();

  // API Kích hoạt thủ công Job dọn dẹp Token
  public manualTriggerCleanupTokens = async (req: Request, res: Response) => {
    try {
      const deletedCount = await this.jobService.cleanupExpiredTokens();

      return res.status(200).json({
        message: 'Kích hoạt dọn dẹp token thành công',
        deleted_count: deletedCount,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        message: 'Lỗi server khi dọn dẹp token',
        error: error.message,
      });
    }
  };
}
