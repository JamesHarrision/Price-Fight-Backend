import { TransactionRepository } from '../repositories/transaction.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';

export class TransactionService {
  private transactionRepo = new TransactionRepository();
  private userRepo = new UserRepository();

  public getUserTransactions = async (userId: string) => {
    return await this.transactionRepo.getUserTransactions(userId);
  };

  public payTransaction = async (transactionId: string, userId: string) => {
    const transaction = await this.transactionRepo.getTransactionById(transactionId);
    if (!transaction) {
      throw new AppError(404, 'Không tìm thấy mã giao dịch này');
    }
    // User không được phép thanh toán hộ/thanh toán trộm đơn của người khác
    if (transaction.user_id !== userId) {
      throw new AppError(403, 'Bạn không có quyền thanh toán cho đơn hàng của người khác');
    }
    // CHỐNG DOUBLE-SPENDING: Nếu đã thanh toán rồi thì chặn đứng ngay lập tức
    if (transaction.status === 'PAID') {
      throw new AppError(400, 'Đơn hàng này đã được thanh toán rồi');
    }
    if (transaction.status === 'FAILED') {
      throw new AppError(400, 'Giao dịch này đã thất bại hoặc quá hạn thanh toán');
    }

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'Không tìm thấy thông tin người dùng');
    }

    if (Number(user.balance) < Number(transaction.amount)) {
      throw new AppError(400, 'Số dư ví của bạn không đủ để thanh toán. Vui lòng nạp thêm!');
    }

    const result = await this.transactionRepo.payTransaction(
      transactionId,
      userId,
      transaction.item_id,
      Number(transaction.amount),
    );

    return result;
  };

  public handleExpiredTransactions = async () => {
    console.log('🔄 [Transaction Job] Đang quét các hóa đơn quá hạn...');
    const X_DAYS = 3; // Quy định 3 ngày
    const expiryDate = new Date();
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
      } catch (error) {
        console.error(`⚠️ [Transaction Job] Lỗi khi hủy hóa đơn ${txn.id}:`, error);
      }
    }

    return cancelCount;
  };
}
