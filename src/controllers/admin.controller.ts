import { Request, Response } from 'express';
import { JobService } from '../services/job.service';

export class AdminController {
  private jobService = new JobService();

  // API Kích hoạt thủ công Job dọn dẹp Token
  public manualTriggerCleanupTokens = async (req: Request, res: Response) => {
    const deletedCount = await this.jobService.cleanupExpiredTokens();

    res.status(200).json({
      message: 'Kích hoạt dọn dẹp token thành công',
      deleted_count: deletedCount,
    });
  };
}
