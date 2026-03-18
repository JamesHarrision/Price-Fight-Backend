import { BidRepository } from '../repositories/bid.repository';
import { ItemRepository } from '../repositories/item.repository';
import { EventRepository } from '../repositories/event.repository';
import { UserRepository } from '../repositories/user.repository';
import { firebaseDB } from '../config/firebase.config';
import { getDate } from '../utils/day.util';
import { AppError } from '../utils/appError';

export class BidService {
  private bidRepo = new BidRepository();
  private itemRepo = new ItemRepository();
  private eventRepo = new EventRepository();
  private userRepo = new UserRepository();

  public placeBid = async (eventId: string, itemId: string, userId: string, amount: number) => {
    // ==========================================
    // BƯỚC 1: VALIDATE DỮ LIỆU TỪ MYSQL
    // ==========================================
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'Người dùng không tồn tại!');
    }

    const isParticipant = await this.eventRepo.checkParticipant(eventId, userId);
    if (!isParticipant) {
      throw new AppError(403, 'Bạn chưa tham gia phòng đấu giá này! Vui lòng tham gia trước khi đặt giá.');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event || event.status !== 'ONGOING') {
      throw new AppError(400, 'Sự kiện này chưa diễn ra hoặc đã kết thúc.');
    }

    const item = await this.itemRepo.getItemById(itemId);
    if (!item || item.event_id !== eventId) {
      throw new AppError(404, 'Vật phẩm không tồn tại trong sự kiện.');
    }

    if (Number(user.balance) < amount) {
      throw new AppError(400, 'Số dư ví của bạn không đủ để đặt mức giá này.');
    }

    // ==========================================
    // BƯỚC 2: FIREBASE TRANSACTION (QUAN TRỌNG)
    // Đảm bảo không bị Race Condition khi 2 người bid cùng lúc
    // ==========================================
    const itemRef = firebaseDB.ref(`events/${eventId}/items/${itemId}`);
    let transactionError: string | null = null;

    const transactionResult = await itemRef.transaction((currentItemData) => {
      // 1. Nếu node chưa được khởi tạo bởi Cronjob
      if (currentItemData === null) {
        transactionError = 'FIREBASE_NODE_NOT_FOUND';
        return null; // Trả về undefined để hủy transaction
      }

      const currentPrice = currentItemData.current_price || Number(item.start_price);
      const stepPrice = Number(item!.step_price);
      const minRequiredPrice = currentPrice + stepPrice;

      // 2. Validate giá bid DỰA TRÊN GIÁ MỚI NHẤT CỦA FIREBASE
      if (amount < minRequiredPrice) {
        transactionError = `INVALID_AMOUNT:${minRequiredPrice}`;
        return; // Hủy transaction
      }

      // 3. Chuẩn bị ghi dữ liệu mới
      if (!currentItemData.bids) {
        currentItemData.bids = {};
      }

      // Sinh tự động 1 key (giống hàm push của firebase)
      const newBidId = itemRef.child('bids').push().key as string;

      // Cập nhật record bid mới
      currentItemData.bids[newBidId] = {
        user_id: user.id,
        full_name: user.full_name,
        amount: amount,
        time: getDate(),
      };

      // Cập nhật giá cao nhất và người giữ giá
      currentItemData.current_price = amount;
      currentItemData.highest_bidder_id = user.id;

      return currentItemData;
    });

    // ==========================================
    // BƯỚC 3: KIỂM TRA KẾT QUẢ TRANSACTION
    // ==========================================
    if (!transactionResult.committed) {
      if (transactionError === 'FIREBASE_NODE_NOT_FOUND') {
        throw new AppError(400, 'Phòng đấu giá đang được khởi tạo, vui lòng thử lại sau vài giây!');
      }
      if (transactionError && (transactionError as string).startsWith('INVALID_AMOUNT')) {
        const minPrice = (transactionError as string).split(':')[1];
        throw new AppError(
          400,
          `Giá đặt không hợp lệ! Bạn phải đặt mức giá tối thiểu là ${Number(minPrice).toLocaleString('vi-VN')}đ`,
        );
      }
      // Nếu bị hủy do mạng hoặc xung đột quá nhanh mà Firebase không xử lý kịp
      throw new AppError(409, 'Hệ thống đang bận do có quá nhiều người đặt giá cùng lúc. Vui lòng thử lại!');
    }

    console.log(`🚀 [Firebase] User ${user.full_name} đã bid thành công ${amount} cho Item ${itemId}`);

    return {
      current_price: amount,
      highest_bidder_id: userId,
    };
  };
}
