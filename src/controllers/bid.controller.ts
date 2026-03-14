import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BidService } from '../services/bid.service';

export class BidController {
  private bidService = new BidService();

  public placeBid = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId, itemId } = req.params;

      const { amount } = req.body;

      const userId = req.user.id;

      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({
          message: 'Số tiền đặt giá không hợp lệ!',
        });
      }

      const result = await this.bidService.placeBid(eventId as string, itemId as string, userId, amount);
      return res.status(201).json({
        message: 'Đặt giá thành công!',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          message: 'Người dùng không tồn tại!',
        });
      }
      if (error.message === 'NOT_PARTICIPANT') {
        return res.status(400).json({
          message: 'Bạn chưa tham gia phòng đấu giá này! Vui lòng tham gia trước khi đặt giá.',
        });
      }
      if (error.message === 'EVENT_NOT_ONGOING') {
        return res.status(400).json({
          message: 'Sự kiện này chưa diễn ra hoặc đã kết thúc.',
        });
      }
      if (error.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({
          message: 'Vật phẩm không tồn tại trong sự kiện.',
        });
      }
      if (error.message.startsWith('INVALID_AMOUNT')) {
        const minPrice = error.message.split(':')[1];
        return res.status(400).json({
          message: `Giá đặt không hợp lệ! Bạn phải đặt mức giá tối thiểu là ${Number(minPrice).toLocaleString('vi-VN')}đ`,
        });
      }
      if (error.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({
          message: 'Số dư ví của bạn không đủ để đặt mức giá này.',
        });
      }
      console.error(error);
      return res.status(500).json({
        message: 'Lỗi server!',
      });
    }
  };
}
