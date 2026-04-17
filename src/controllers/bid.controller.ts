import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BidService } from '../services/bid.service';
import { AppError } from '../utils/appError';

export class BidController {
  private bidService = new BidService();

  public placeBid = async (req: AuthRequest, res: Response) => {
    const { eventId, itemId } = req.params;

    const { amount } = req.body;

    const userId = req.user.id;

    if (!amount || isNaN(Number(amount))) {
      throw new AppError(400, 'Số tiền đặt giá không hợp lệ!');
    }

    const result = await this.bidService.placeBid(eventId as string, itemId as string, userId, amount);
    return res.status(201).json({
      message: 'Đặt giá thành công!',
      data: result,
    });
  };
}
