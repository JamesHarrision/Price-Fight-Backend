import { BidRepository } from '../repositories/bid.repository';
import { ItemRepository } from '../repositories/item.repository';
import { EventRepository } from '../repositories/event.repository';
import { UserRepository } from '../repositories/user.repository';
import { FirebaseUtils } from '../utils/firebase.util';
import { firebaseDB } from '../config/firebase.config';

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
      throw new Error('USER_NOT_FOUND');
    }

    const isParticipant = await this.eventRepo.checkParticipant(eventId, userId);
    if (!isParticipant) {
      throw new Error('NOT_PARTICIPANT');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event || event.status !== 'ONGOING') {
      throw new Error('EVENT_NOT_ONGOING');
    }

    const item = await this.itemRepo.getItemById(itemId);
    if (!item || item.event_id !== eventId) {
      throw new Error('ITEM_NOT_FOUND');
    }

    if (Number(user.balance) < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
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
        currentItemData.bids = { };
      }

      // Sinh tự động 1 key (giống hàm push của firebase)
      const newBidId = itemRef.child('bids').push().key as string;

      // Cập nhật record bid mới
      currentItemData.bids[newBidId] = {
        user_id: user.id,
        full_name: user.full_name,
        amount: amount,
        time: new Date().toISOString(),
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
      if (transactionError) {
        // Nếu bị hủy do logic bên trong (lỗi giá thấp, chưa có node...)
        throw new Error(transactionError);
      }
      // Nếu bị hủy do mạng hoặc xung đột quá nhanh mà Firebase không xử lý kịp
      throw new Error("RACE_CONDITION_FAILED");
    }

    console.log(`🚀 [Firebase] User ${user.full_name} đã bid thành công ${amount} cho Item ${itemId}`);

    return {
      current_price: amount,
      highest_bidder_id: userId,
    };
  };
}
