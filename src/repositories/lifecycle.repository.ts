import { EventStatus, ItemStatus } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export class LifeCycleRepository {


  public startEvent = async (event_id: string) => {
    return await prisma.$transaction(async (tx) => {
      await tx.auctionEvent.updateMany({
        where: {
          id: event_id
        },
        data: { status: EventStatus.ONGOING }
      });

      await tx.auctionItem.updateMany({
        where: {
          event_id: event_id
        },
        data: { status: ItemStatus.LIVE }
      })
    })
  }

  public endEventTransaction = async (
    eventId: string,
    soldItems: { id: string; winner_id: string; current_price: number }[],
    unsoldItemIds: string[],
    bidsToInsert: any[],
    transactionsToInsert: any[]
  ) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái sự kiện thành ENDED
      await tx.auctionEvent.update({
        where: { id: eventId },
        data: { status: EventStatus.ENDED }
      });

      // 2. Cập nhật trạng thái cho các vật phẩm ĐÃ BÁN
      for (const item of soldItems) {
        await tx.auctionItem.update({
          where: { id: item.id },
          data: {
            status: ItemStatus.SOLD,
            winner_id: item.winner_id,
            current_price: item.current_price
          }
        });
      }

      // 3. Cập nhật hàng loạt trạng thái cho các vật phẩm Ế KHÁCH (CHƯA BÁN ĐƯỢC)
      if (unsoldItemIds.length > 0) {
        await tx.auctionItem.updateMany({
          where: { id: { in: unsoldItemIds } },
          data: { status: ItemStatus.UNSOLD }
        });
      }

      // 4. Đổ toàn bộ lịch sử bid vào bảng BidHistory (nếu có)
      if (bidsToInsert.length > 0) {
        await tx.bidHistory.createMany({
          data: bidsToInsert
        });
      }

      // 5. Tạo hóa đơn cho người thắng (nếu có)
      if (transactionsToInsert.length > 0) {
        await tx.transaction.createMany({
          data: transactionsToInsert
        });
      }
    });
  }
}