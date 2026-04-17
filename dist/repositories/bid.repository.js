"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidRepository = void 0;
const prisma_config_1 = require("../config/prisma.config");
const day_util_1 = require("../utils/day.util");
class BidRepository {
    constructor() {
        this.getBidByUserAndEvent = async (userId, eventId) => {
            return await prisma_config_1.prisma.bidHistory.findFirst({
                where: {
                    user_id: userId,
                    item: {
                        event_id: eventId,
                    },
                },
            });
        };
        this.placeBidTransaction = async (itemId, userId, amount) => {
            console.log('=== KIỂM TRA DỮ LIỆU ĐẦU VÀO ===');
            console.log('1. Item ID:', itemId);
            console.log('2. User ID:', userId);
            console.log('3. Amount:', amount);
            console.log('===============================');
            return await prisma_config_1.prisma.$transaction(async (tx) => {
                const newBid = await tx.bidHistory.create({
                    data: {
                        item_id: itemId,
                        user_id: userId,
                        amount: amount,
                        time: (0, day_util_1.getDate)()
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
}
exports.BidRepository = BidRepository;
