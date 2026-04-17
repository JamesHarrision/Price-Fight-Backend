"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidController = void 0;
const bid_service_1 = require("../services/bid.service");
const appError_1 = require("../utils/appError");
class BidController {
    constructor() {
        this.bidService = new bid_service_1.BidService();
        this.placeBid = async (req, res) => {
            const { eventId, itemId } = req.params;
            const { amount } = req.body;
            const userId = req.user.id;
            if (!amount || isNaN(Number(amount))) {
                throw new appError_1.AppError(400, 'Số tiền đặt giá không hợp lệ!');
            }
            const result = await this.bidService.placeBid(eventId, itemId, userId, amount);
            return res.status(201).json({
                message: 'Đặt giá thành công!',
                data: result,
            });
        };
    }
}
exports.BidController = BidController;
