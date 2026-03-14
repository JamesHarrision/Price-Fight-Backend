import cron from 'node-cron';
import { JobService } from '../services/job.service';
import { LifeCycleService } from '../services/lifecycle.service';
import { TransactionService } from '../services/transaction.service';

const jobService = new JobService();
const transactionService = new TransactionService();
const lifecycleService = new LifeCycleService();

export const startCronJobs = () => {
  // Quy tắc hẹn giờ (Cron Expression): '0 0 * * *' nghĩa là chạy vào đúng 00:00 (nửa đêm) mỗi ngày
  // Nếu bạn muốn test chạy mỗi phút 1 lần thì đổi thành: '* * * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Tự động kích hoạt dọn dẹp token rác...');
    try {
      await jobService.cleanupExpiredTokens();
    } catch (error) {
      console.error('❌ [Cron] Lỗi khi chạy job dọn token rác tự động:', error);
    }
  });

  let isStartingEvent = false;
  cron.schedule('*/10 * * * * *', async () => {
    if (isStartingEvent) return;
    isStartingEvent = true;
    try {
      await lifecycleService.startPendingEvent();
    } catch (error) {
      console.error('❌ [Cron] Lỗi khi chạy job khởi động sự kiện tự động:', error);
    } finally {
      isStartingEvent = false;
    }
  });

  let isCheckingTransactions = false;
  cron.schedule('* * * * *', async () => {
    if (isCheckingTransactions) return;
    isCheckingTransactions = true;
    try {
      await transactionService.handleExpiredTransactions();
    } catch (error) {
      console.error('❌ [Cron] Lỗi khi quét hóa đơn quá hạn:', error);
    } finally {
      isCheckingTransactions = false;
    }
  });

  console.log('🤖 [Cron] Hệ thống tác vụ chạy ngầm đã được khởi động!');
};
