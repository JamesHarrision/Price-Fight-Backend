"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const job_service_1 = require("../services/job.service");
const lifecycle_service_1 = require("../services/lifecycle.service");
const transaction_service_1 = require("../services/transaction.service");
const jobService = new job_service_1.JobService();
const transactionService = new transaction_service_1.TransactionService();
const lifecycleService = new lifecycle_service_1.LifeCycleService();
const startCronJobs = () => {
    // Quy tắc hẹn giờ (Cron Expression): '0 0 * * *' nghĩa là chạy vào đúng 00:00 (nửa đêm) mỗi ngày
    // Nếu bạn muốn test chạy mỗi phút 1 lần thì đổi thành: '* * * * *'
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('⏰ [Cron] Tự động kích hoạt dọn dẹp token rác...');
        try {
            await jobService.cleanupExpiredTokens();
        }
        catch (error) {
            console.error('❌ [Cron] Lỗi khi chạy job dọn token rác tự động:', error);
        }
    });
    let isProcessingEvents = false;
    node_cron_1.default.schedule("*/10 * * * * *", async () => {
        if (isProcessingEvents)
            return;
        isProcessingEvents = true;
        try {
            await lifecycleService.startPendingEvent();
            await lifecycleService.endExpiredEvents();
        }
        catch (error) {
            console.error('❌ [Cron] Lỗi khi chạy job lifecycle sự kiện:', error);
        }
        finally {
            isProcessingEvents = false;
        }
    });
    let isCheckingTransactions = false;
    node_cron_1.default.schedule('* * * * *', async () => {
        if (isCheckingTransactions)
            return;
        isCheckingTransactions = true;
        try {
            await transactionService.handleExpiredTransactions();
        }
        catch (error) {
            console.error('❌ [Cron] Lỗi khi quét hóa đơn quá hạn:', error);
        }
        finally {
            isCheckingTransactions = false;
        }
    });
    console.log('🤖 [Cron] Hệ thống tác vụ chạy ngầm đã được khởi động!');
};
exports.startCronJobs = startCronJobs;
