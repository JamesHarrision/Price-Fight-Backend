import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TransactionService } from '../services/transaction.service';
import { AppError } from '../utils/appError';

export class TransactionController {
  private transactionService = new TransactionService();

  public getUserTransactions = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const transactions = await this.transactionService.getUserTransactions(userId);

    res.status(200).json({
      message: 'Lấy lịch sử giao dịch thành công!',
      data: transactions,
    });
  };

  public payTransaction = async (req: AuthRequest, res: Response) => {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const result = await this.transactionService.payTransaction(transactionId as string, userId as string);

    return res.status(200).json({
      message: 'Thanh toán thành công!',
      data: result,
    });
  };
}
