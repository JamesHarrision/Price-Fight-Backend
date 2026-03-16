import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  private transactionService = new TransactionService();

  public getUserTransactions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const transactions = await this.transactionService.getUserTransactions(userId);

      res.status(200).json({
        message: 'Lấy lịch sử giao dịch thành công!',
        data: transactions,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        message: 'Lỗi server khi lấy lịch sử giao dịch',
      });
    }
  };

  public payTransaction = async (req: AuthRequest, res: Response) => {
    try {
      const { transactionId } = req.params;
      const userId = req.user.id;

      const result = await this.transactionService.payTransaction(transactionId as string, userId as string);

      return res.status(200).json({
        message: 'Thanh toán thành công!',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'TRANSACTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Không tìm thấy mã giao dịch này' });
      }
      if (error.message === 'NOT_YOUR_TRANSACTION') {
        return res.status(403).json({ message: 'Bạn không có quyền thanh toán cho đơn hàng của người khác' });
      }
      if (error.message === 'ALREADY_PAID') {
        return res.status(400).json({ message: 'Đơn hàng này đã được thanh toán rồi' });
      }
      if (error.message === 'TRANSACTION_FAILED') {
        return res.status(400).json({ message: 'Giao dịch này đã thất bại hoặc quá hạn thanh toán' });
      }
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
      }
      if (error.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({ message: 'Số dư ví của bạn không đủ để thanh toán. Vui lòng nạp thêm!' });
      }

      console.error(error);
      return res.status(500).json({ message: 'Lỗi server khi xử lý thanh toán' });
    }
  };
}
