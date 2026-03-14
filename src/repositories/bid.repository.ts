import { prisma } from '../config/prisma.config';

export class BidRepository {
  public getBidByUserAndEvent = async (userId: string, eventId: string) => {
    return await prisma.bidHistory.findFirst({
      where: {
        user_id: userId,
        item: {
          event_id: eventId,
        },
      },
    });
  };

  public placeBidTransaction = async (itemId: string, userId: string, amount: number) => {
    console.log('=== KIỂM TRA DỮ LIỆU ĐẦU VÀO ===');
    console.log('1. Item ID:', itemId);
    console.log('2. User ID:', userId);
    console.log('3. Amount:', amount);
    console.log('===============================');
    return await prisma.$transaction(async (tx) => {
      const newBid = await tx.bidHistory.create({
        data: {
          item_id: itemId,
          user_id: userId,
          amount: amount,
        },
      });

      const updatedItem = await tx.auctionItem.update({
        where: { id: itemId },
        data: {
          current_price: amount,
        },
      });

      return { newBid, updatedItem };
    });
  };
}
