"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycleRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_config_1 = require("../config/prisma.config");
class LifeCycleRepository {
    constructor() {
        this.startEvent = async (event_id) => {
            return await prisma_config_1.prisma.$transaction(async (tx) => {
                await tx.auctionEvent.updateMany({
                    where: {
                        id: event_id
                    },
                    data: { status: client_1.EventStatus.ONGOING }
                });
                await tx.auctionItem.updateMany({
                    where: {
                        event_id: event_id
                    },
                    data: { status: client_1.ItemStatus.LIVE }
                });
            });
        };
        this.endEventTransaction = async (eventId, soldItems, unsoldItemIds, bidsToInsert, transactionsToInsert) => {
            return await prisma_config_1.prisma.$transaction(async (tx) => {
                // 1. Cập nhật trạng thái sự kiện thành ENDED
                await tx.auctionEvent.update({
                    where: { id: eventId },
                    data: { status: client_1.EventStatus.ENDED }
                });
                // 2. Cập nhật trạng thái cho các vật phẩm ĐÃ BÁN
                for (const item of soldItems) {
                    await tx.auctionItem.update({
                        where: { id: item.id },
                        data: {
                            status: client_1.ItemStatus.SOLD,
                            winner_id: item.winner_id,
                            current_price: item.current_price
                        }
                    });
                }
                // 3. Cập nhật hàng loạt trạng thái cho các vật phẩm Ế KHÁCH (CHƯA BÁN ĐƯỢC)
                if (unsoldItemIds.length > 0) {
                    await tx.auctionItem.updateMany({
                        where: { id: { in: unsoldItemIds } },
                        data: { status: client_1.ItemStatus.UNSOLD }
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
        };
    }
}
exports.LifeCycleRepository = LifeCycleRepository;
