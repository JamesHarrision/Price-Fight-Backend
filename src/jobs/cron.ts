import cron from 'node-cron';
import { JobService } from '../services/job.service';

const jobService = new JobService();

export const startCronJobs = () => {
  // Quy tắc hẹn giờ (Cron Expression): '0 0 * * *' nghĩa là chạy vào đúng 00:00 (nửa đêm) mỗi ngày
  // Nếu bạn muốn test chạy mỗi phút 1 lần thì đổi thành: '* * * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Tự động kích hoạt dọn dẹp token rác...');
    try {
      await jobService.cleanupExpiredTokens();
    } catch (error) {
      console.error('❌ [Cron] Lỗi khi chạy job tự động:', error);
    }
  });

  console.log('🤖 [Cron] Hệ thống tác vụ chạy ngầm đã được khởi động!');
};
