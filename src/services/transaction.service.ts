import { TransactionRepository } from '../repositories/transaction.repository';
import { UserRepository } from '../repositories/user.repository';

export class TransactionService {
  private transactionRepo = new TransactionRepository();
  private userRepo = new UserRepository();

  public getUserTransactions = async (userId: string) => {
    return await this.transactionRepo.getUserTransactions(userId);
  };

  public payTransaction = async (transactionId: string, userId: string) => {
    const transaction = await this.transactionRepo.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    // User không được phép thanh toán hộ/thanh toán trộm đơn của người khác
    if (transaction.user_id !== userId) {
      throw new Error('NOT_YOUR_TRANSACTION');
    }
    // CHỐNG DOUBLE-SPENDING: Nếu đã thanh toán rồi thì chặn đứng ngay lập tức
    if (transaction.status === 'PAID') {
      throw new Error('ALREADY_PAID');
    }
    if (transaction.status === 'FAILED') {
      throw new Error('TRANSACTION_FAILED');
    }

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (Number(user.balance) < Number(transaction.amount)) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    const result = await this.transactionRepo.payTransaction(
      transactionId,
      userId,
      transaction.item_id,
      Number(transaction.amount),
    );

    return result;
  };
}
