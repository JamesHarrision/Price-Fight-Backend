import { BidRepository } from '../repositories/bid.repository';
import { ItemRepository } from '../repositories/item.repository';
import { EventRepository } from '../repositories/event.repository';
import { UserRepository } from '../repositories/user.repository';
import { FirebaseUtils } from '../utils/firebase.util';

export class BidService {
  private bidRepo = new BidRepository();
  private itemRepo = new ItemRepository();
  private eventRepo = new EventRepository();
  private userRepo = new UserRepository();

  public placeBid = async (eventId: string, itemId: string, userId: string, amount: number) => {
    // 1
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

    // 2 Nếu chưa ai đặt thì lấy giá khởi điểm, nếu có rồi thì lấy giá hiện tại
    const currentPrice = item.current_price ? Number(item.current_price) : Number(item.start_price);
    const stepPrice = Number(item.step_price);
    const minRequiredPrice = currentPrice + stepPrice;

    if (amount < minRequiredPrice) {
      throw new Error(`INVALID_AMOUNT:${minRequiredPrice}`);
    }

    if (Number(user.balance) < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    // 3
    const { newBid, updatedItem } = await this.bidRepo.placeBidTransaction(itemId, eventId, amount);

    // 4
    try {
      const basePath = `events/${eventId}/items/${itemId}`;

      await FirebaseUtils.updateData(basePath, {
        current_price: amount,
        highest_bidder_id: userId,
      });

      await FirebaseUtils.pushData(`${basePath}/bids`, {
        user_id: userId,
        full_name: user.full_name,
        amount: amount,
        time: new Date().toISOString(),
      });

      console.log(`🚀 [Firebase] Đã đồng bộ giá mới ${amount} cho Item ${itemId}`);
    } catch (firebaseError) {
      console.error('❌ [Firebase] Lỗi đồng bộ realtime:', firebaseError);
    }

    return { newBid, updatedItem };
  };
}
