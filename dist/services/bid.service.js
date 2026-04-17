"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidService = void 0;
const bid_repository_1 = require("../repositories/bid.repository");
const item_repository_1 = require("../repositories/item.repository");
const event_repository_1 = require("../repositories/event.repository");
const user_repository_1 = require("../repositories/user.repository");
const firebase_config_1 = require("../config/firebase.config");
const day_util_1 = require("../utils/day.util");
const appError_1 = require("../utils/appError");
class BidService {
    constructor() {
        this.bidRepo = new bid_repository_1.BidRepository();
        this.itemRepo = new item_repository_1.ItemRepository();
        this.eventRepo = new event_repository_1.EventRepository();
        this.userRepo = new user_repository_1.UserRepository();
        this.placeBid = async (eventId, itemId, userId, amount) => {
            // ==========================================
            // BƯỚC 1: VALIDATE DỮ LIỆU TỪ MYSQL
            // ==========================================
            const user = await this.userRepo.getUserById(userId);
            if (!user) {
                throw new appError_1.AppError(404, 'Người dùng không tồn tại!');
            }
            const isParticipant = await this.eventRepo.checkParticipant(eventId, userId);
            if (!isParticipant) {
                throw new appError_1.AppError(403, 'Bạn chưa tham gia phòng đấu giá này! Vui lòng tham gia trước khi đặt giá.');
            }
            const event = await this.eventRepo.findById(eventId);
            if (!event || event.status !== 'ONGOING') {
                throw new appError_1.AppError(400, 'Sự kiện này chưa diễn ra hoặc đã kết thúc.');
            }
            const item = await this.itemRepo.getItemById(itemId);
            if (!item || item.event_id !== eventId) {
                throw new appError_1.AppError(404, 'Vật phẩm không tồn tại trong sự kiện.');
            }
            if (Number(user.balance) < amount) {
                throw new appError_1.AppError(400, 'Số dư ví của bạn không đủ để đặt mức giá này.');
            }
            // ==========================================
            // BƯỚC 2: FIREBASE TRANSACTION (QUAN TRỌNG)
            // Đảm bảo không bị Race Condition khi 2 người bid cùng lúc
            // ==========================================
            const itemRef = firebase_config_1.firebaseDB.ref(`events/${eventId}/items/${itemId}`);
            let transactionError = null;
            const transactionResult = await itemRef.transaction((currentItemData) => {
                // 1. Nếu node chưa được khởi tạo bởi Cronjob
                if (currentItemData === null) {
                    transactionError = 'FIREBASE_NODE_NOT_FOUND';
                    return null; // Trả về undefined để hủy transaction (KHÔNG PHẢI null)
                }
                const currentPrice = currentItemData.current_price || Number(item.start_price);
                const stepPrice = Number(item.step_price);
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
                const newBidId = itemRef.child('bids').push().key;
                // Cập nhật record bid mới
                currentItemData.bids[newBidId] = {
                    user_id: user.id,
                    full_name: user.full_name,
                    amount: amount,
                    time: (0, day_util_1.getDate)().toISOString(),
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
                    throw new appError_1.AppError(400, 'Phòng đấu giá đang được khởi tạo, vui lòng thử lại sau vài giây!');
                }
                if (transactionError && transactionError.startsWith('INVALID_AMOUNT')) {
                    const minPrice = transactionError.split(':')[1];
                    throw new appError_1.AppError(400, `Giá đặt không hợp lệ! Bạn phải đặt mức giá tối thiểu là ${Number(minPrice).toLocaleString('vi-VN')}đ`);
                }
                // Nếu bị hủy do mạng hoặc xung đột quá nhanh mà Firebase không xử lý kịp
                throw new appError_1.AppError(409, 'Hệ thống đang bận do có quá nhiều người đặt giá cùng lúc. Vui lòng thử lại!');
            }
            console.log(`🚀 [Firebase] User ${user.full_name} đã bid thành công ${amount} cho Item ${itemId}`);
            return {
                current_price: amount,
                highest_bidder_id: userId,
            };
        };
    }
}
exports.BidService = BidService;
