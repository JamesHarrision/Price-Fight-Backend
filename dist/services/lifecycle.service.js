"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycleService = void 0;
const event_repository_1 = require("../repositories/event.repository");
const lifecycle_repository_1 = require("../repositories/lifecycle.repository");
const firebase_util_1 = require("../utils/firebase.util");
class LifeCycleService {
    constructor() {
        this.eventRepo = new event_repository_1.EventRepository();
        this.lifecycleRepo = new lifecycle_repository_1.LifeCycleRepository();
        this.startPendingEvent = async () => {
            try {
                const pendingEvents = await this.eventRepo.getPendingEvents();
                if (pendingEvents.length === 0) {
                    return;
                }
                console.log(`[Lifecycle] Tìm thấy ${pendingEvents.length} sự kiện tới giờ bắt đầu.`);
                // Xử lý từng sự kiện một
                for (const event of pendingEvents) {
                    try {
                        //. Chuẩn bị Payload cho Firebase
                        const firebasePayload = { ...event, items: {} };
                        for (const item of event.items) {
                            firebasePayload.items[item.id] = {
                                current_price: Number(item.start_price),
                                highest_bidder_id: null,
                                bids: {},
                            };
                        }
                        //. Đẩy dữ liệu lên Firebase
                        const firebasePath = `events/${event.id}`;
                        console.log(firebasePath, firebasePayload);
                        await firebase_util_1.FirebaseUtils.setData(firebasePath, firebasePayload);
                        console.log(`[Firebase] Đã khởi tạo node cho sự kiện ${event.id}`);
                        //. Cập nhật trạng thái MySQL (Dùng Transaction để đảm bảo an toàn)
                        await this.lifecycleRepo.startEvent(event.id);
                        console.log(`✅ [Lifecycle] Đã mở cửa thành công sự kiện: ${event.title}`);
                    }
                    catch (error) {
                        console.error(`❌ [Lifecycle] Lỗi khi mở sự kiện ${event.id}:`, error);
                    }
                }
            }
            catch (error) {
                console.error('❌ [Lifecycle] Lỗi hệ thống khi chạy startPendingEvents:', error);
            }
        };
        this.endExpiredEvents = async () => {
            try {
                // Bước 1: Đi tuần tra tìm phòng hết giờ
                const endedEvents = await this.eventRepo.getEndedOngoingEvents();
                if (endedEvents.length === 0)
                    return;
                console.log(`[Lifecycle] Phát hiện ${endedEvents.length} sự kiện đã kết thúc, tiến hành chốt sổ...`);
                for (const event of endedEvents) {
                    try {
                        // Bước 2: Tịch thu sổ ghi chép từ Firebase
                        const firebasePath = `events/${event.id}`;
                        const firebaseData = await firebase_util_1.FirebaseUtils.getData(firebasePath);
                        const soldItems = [];
                        const unsoldItemIds = [];
                        const bidsToInsert = [];
                        const transactionsToInsert = [];
                        // Bước 3: Ngồi xuống đối soát từng vật phẩm
                        if (firebaseData && firebaseData.items) {
                            for (const item of event.items) {
                                const fbItem = firebaseData.items[item.id];
                                if (!fbItem)
                                    continue;
                                //Gom lịch sử Bids
                                if (fbItem.bids) {
                                    for (const bidKey in fbItem.bids) {
                                        const bid = fbItem.bids[bidKey];
                                        if (item.id && bid.user_id && bid.amount) {
                                            bidsToInsert.push({
                                                item_id: item.id,
                                                user_id: bid.user_id,
                                                amount: bid.amount,
                                                time: bid.time ? new Date(bid.time) : new Date()
                                            });
                                        }
                                    }
                                }
                                // 3.2 Kiểm tra có người mua hay ế khách
                                if (fbItem.highest_bidder_id) {
                                    soldItems.push({
                                        id: item.id,
                                        winner_id: fbItem.highest_bidder_id,
                                        current_price: fbItem.current_price
                                    });
                                    transactionsToInsert.push({
                                        item_id: item.id,
                                        user_id: fbItem.highest_bidder_id,
                                        amount: fbItem.current_price,
                                        status: "PENDING",
                                    });
                                }
                                else {
                                    unsoldItemIds.push(item.id);
                                }
                            }
                        }
                        else {
                            // Nếu mất data Firebase (rất hiếm), fallback đánh dấu ế hết
                            for (const item of event.items) {
                                unsoldItemIds.push(item.id);
                            }
                        }
                        console.log(bidsToInsert);
                        // Bước 4: Đóng mộc, vào sổ cái (Lưu xuống MySQL)
                        await this.lifecycleRepo.endEventTransaction(event.id, soldItems, unsoldItemIds, bidsToInsert, transactionsToInsert);
                        console.log(`✅ [Lifecycle] Chốt sổ thành công sự kiện: ${event.title}`);
                        // Bước 5: Đốt sổ nháp (Xóa trên Firebase)
                        await firebase_util_1.FirebaseUtils.deleteData(firebasePath);
                        console.log(`🔥 [Firebase] Đã dọn dẹp data nháp của sự kiện: ${event.id}`);
                    }
                    catch (error) {
                        console.error(`❌ [Lifecycle] Lỗi khi xử lý chốt sổ sự kiện ${event.id}:`, error);
                    }
                }
            }
            catch (error) {
                console.error('❌ [Lifecycle] Lỗi hệ thống khi chạy endExpiredEvents:', error);
            }
        };
    }
}
exports.LifeCycleService = LifeCycleService;
