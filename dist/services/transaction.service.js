"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_repository_1 = require("../repositories/transaction.repository");
const user_repository_1 = require("../repositories/user.repository");
const appError_1 = require("../utils/appError");
const day_util_1 = require("../utils/day.util");
class TransactionService {
    constructor() {
        this.transactionRepo = new transaction_repository_1.TransactionRepository();
        this.userRepo = new user_repository_1.UserRepository();
        this.getUserTransactions = async (userId) => {
            return await this.transactionRepo.getUserTransactions(userId);
        };
        this.payTransaction = async (transactionId, userId) => {
            const transaction = await this.transactionRepo.getTransactionById(transactionId);
            if (!transaction) {
                throw new appError_1.AppError(404, 'Không tìm thấy mã giao dịch này');
            }
            // User không được phép thanh toán hộ/thanh toán trộm đơn của người khác
            if (transaction.user_id !== userId) {
                throw new appError_1.AppError(403, 'Bạn không có quyền thanh toán cho đơn hàng của người khác');
            }
            // CHỐNG DOUBLE-SPENDING: Nếu đã thanh toán rồi thì chặn đứng ngay lập tức
            if (transaction.status === 'PAID') {
                throw new appError_1.AppError(400, 'Đơn hàng này đã được thanh toán rồi');
            }
            if (transaction.status === 'FAILED') {
                throw new appError_1.AppError(400, 'Giao dịch này đã thất bại hoặc quá hạn thanh toán');
            }
            const user = await this.userRepo.getUserById(userId);
            if (!user) {
                throw new appError_1.AppError(404, 'Không tìm thấy thông tin người dùng');
            }
            if (Number(user.balance) < Number(transaction.amount)) {
                throw new appError_1.AppError(400, 'Số dư ví của bạn không đủ để thanh toán. Vui lòng nạp thêm!');
            }
            const result = await this.transactionRepo.payTransaction(transactionId, userId, transaction.item_id, Number(transaction.amount));
            return result;
        };
        this.handleExpiredTransactions = async () => {
            console.log('🔄 [Transaction Job] Đang quét các hóa đơn quá hạn...');
            const X_DAYS = 3; // Quy định 3 ngày
            const expiryDate = (0, day_util_1.getDate)();
            expiryDate.setDate(expiryDate.getDate() - X_DAYS);
            const expiredTxns = await this.transactionRepo.getExpiredPendingTransactions(expiryDate);
            if (expiredTxns.length === 0) {
                console.log('✅ [Transaction Job] Không có hóa đơn nào quá hạn.');
                return 0;
            }
            let cancelCount = 0;
            for (const txn of expiredTxns) {
                try {
                    await this.transactionRepo.cancelTransaction(txn.id, txn.item_id);
                    cancelCount++;
                    console.log(`❌ [Transaction Job] Đã hủy hóa đơn ${txn.id} (Quá hạn thanh toán)`);
                }
                catch (error) {
                    console.error(`⚠️ [Transaction Job] Lỗi khi hủy hóa đơn ${txn.id}:`, error);
                }
            }
            return cancelCount;
        };
    }
}
exports.TransactionService = TransactionService;
