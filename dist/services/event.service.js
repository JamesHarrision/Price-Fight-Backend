"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const bid_repository_1 = require("../repositories/bid.repository");
const event_repository_1 = require("../repositories/event.repository");
const item_repository_1 = require("../repositories/item.repository");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const user_repository_1 = require("../repositories/user.repository");
const day_util_1 = require("../utils/day.util");
const appError_1 = require("../utils/appError");
class EventService {
    constructor() {
        this.eventRepo = new event_repository_1.EventRepository();
        this.itemRepo = new item_repository_1.ItemRepository();
        this.bidRepo = new bid_repository_1.BidRepository();
        this.userRepo = new user_repository_1.UserRepository();
        this.createEvent = async (data) => {
            const start = (0, day_util_1.parseDate)(data.start_time);
            const end = (0, day_util_1.parseDate)(data.end_time);
            if (start < (0, day_util_1.getDate)())
                throw new appError_1.AppError(400, 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
            if (start > end)
                throw new appError_1.AppError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
            const formattedData = {
                ...data,
                start_time: start,
                end_time: end,
                cover_image: data.cover_image || null
            };
            return await this.eventRepo.create(formattedData);
        };
        this.updateEvent = async (id, data) => {
            const existingEvent = await this.eventRepo.findById(id);
            if (!existingEvent)
                throw new appError_1.AppError(404, 'Sự kiện không tồn tại');
            const updateData = { ...data };
            // Convert datetime strings sang Date object cho Prisma
            if (updateData.start_time)
                updateData.start_time = (0, day_util_1.parseDate)(updateData.start_time);
            if (updateData.end_time)
                updateData.end_time = (0, day_util_1.parseDate)(updateData.end_time);
            // Nếu có cập nhật thời gian thì mới validate lại
            if (data.start_time || data.end_time) {
                const start = updateData.start_time || existingEvent.start_time;
                const end = updateData.end_time || existingEvent.end_time;
                if (start < (0, day_util_1.getDate)())
                    throw new appError_1.AppError(400, 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
                if (start > end)
                    throw new appError_1.AppError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
            }
            if (existingEvent.cover_image && data.cover_image) {
                await (0, cloudinary_util_1.deleteImageFromCloudinary)(existingEvent.cover_image);
            }
            return await this.eventRepo.update(id, updateData);
        };
        this.deleteEvent = async (id) => {
            const existingEvent = await this.eventRepo.findById(id);
            if (!existingEvent)
                throw new appError_1.AppError(404, 'Không tìm thấy sự kiện');
            const items = (await this.itemRepo.getItemsByEventId(id)).items;
            await Promise.all(items.map(async (item) => {
                const imagesToDelete = [];
                if (item.images) {
                    imagesToDelete.push(...item.images);
                }
                await Promise.all(imagesToDelete.map(async (image) => (0, cloudinary_util_1.deleteImageFromCloudinary)(image)));
            }));
            if (existingEvent.cover_image) {
                await (0, cloudinary_util_1.deleteImageFromCloudinary)(existingEvent.cover_image);
            }
            return await this.eventRepo.delete(id);
        };
        this.getEvent = async (id) => {
            const existingEvent = await this.eventRepo.findById(id);
            if (!existingEvent)
                throw new appError_1.AppError(404, 'Không tìm thấy sự kiện');
            return await this.eventRepo.findById(id);
        };
        this.removeUserFromEvent = async (eventId, userId) => {
            const isWinner = await this.itemRepo.getItemByWinnerId(eventId, userId);
            if (isWinner)
                throw new appError_1.AppError(400, 'Không thể xóa: Người dùng đang là người thắng cuộc của vật phẩm trong sự kiện này.');
            const hasBids = await this.bidRepo.getBidByUserAndEvent(userId, eventId);
            if (hasBids)
                throw new appError_1.AppError(400, 'Không thể xóa: Người dùng đã tham gia đấu giá trong sự kiện này.');
            const participant = await this.eventRepo.getEventUserById(eventId, userId);
            if (!participant)
                throw new appError_1.AppError(404, 'Người dùng chưa tham gia sự kiện này.');
            await this.eventRepo.kickUserOutEvent(eventId, userId);
            return true;
        };
        this.addParticipantByAdmin = async (eventId, userId) => {
            const event = await this.eventRepo.findById(eventId);
            if (!event)
                throw new appError_1.AppError(404, "Sự kiện không tồn tại");
            const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
            if (isJoined)
                throw new appError_1.AppError(400, "Đã tham gia sự kiện");
            const user = await this.userRepo.getUserById(userId);
            if (!user)
                throw new appError_1.AppError(404, "Người dùng không tồn tại");
            return await this.eventRepo.addParticipant(eventId, userId);
        };
        this.joinEvent = async (eventId, userId) => {
            const event = await this.eventRepo.findById(eventId);
            if (!event) {
                throw new appError_1.AppError(404, 'Không tìm thấy sự kiện');
            }
            if (event.status === 'ENDED') {
                throw new appError_1.AppError(400, 'Sự kiện đã kết thúc, không thể tham gia');
            }
            const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
            if (isJoined) {
                throw new appError_1.AppError(400, 'Bạn đã tham gia sự kiện này rồi');
            }
            const user = await this.userRepo.getUserById(userId);
            if (!user) {
                throw new appError_1.AppError(404, 'Không tìm thấy người dùng');
            }
            const { items } = await this.itemRepo.getItemsByEventId(eventId);
            if (items.length > 0) {
                const minPrice = Math.min(...items.map((item) => Number(item.start_price)));
                if (Number(user.balance) < minPrice) {
                    throw new appError_1.AppError(400, `Số dư của bạn không đủ! Cần ít nhất ${Number(minPrice).toLocaleString('vi-VN')}đ (giá của vật phẩm rẻ nhất) để tham gia phòng này.`);
                }
            }
            return await this.eventRepo.addParticipant(eventId, userId);
        };
        this.getAllEvents = async (page = 1, limit = 10, status) => {
            if (page <= 0 || limit <= 0)
                throw new appError_1.AppError(400, "Truy vấn không hợp lệ");
            return await this.eventRepo.getAllEvents(page, limit, status);
        };
        this.getParticipants = async (eventId) => {
            return await this.eventRepo.getParticipantsByEventId(eventId);
        };
    }
}
exports.EventService = EventService;
