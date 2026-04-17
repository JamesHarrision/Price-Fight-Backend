"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("../services/event.service");
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
class EventController {
    constructor() {
        this.eventService = new event_service_1.EventService();
        this.createEvent = async (req, res) => {
            const { title, description, start_time, end_time } = req.body;
            let cover_image = '';
            if (req.file) {
                cover_image = req.file.path;
            }
            const event = await this.eventService.createEvent({
                title,
                description,
                start_time,
                end_time,
                cover_image,
            });
            return res.status(201).json({
                message: 'Thêm mới sự kiện thành công',
                data: event,
            });
        };
        this.updateEvent = async (req, res) => {
            const { eventId } = req.params;
            const { title, description, start_time, end_time } = req.body;
            let cover_image = '';
            if (req.file) {
                cover_image = req.file.path;
            }
            const updateData = { title, description, start_time, end_time, cover_image };
            Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
            const event = await this.eventService.updateEvent(eventId, updateData);
            return res.status(201).json({
                message: 'Cập nhật sự kiện thành công',
                data: event,
            });
        };
        this.deleteEvent = async (req, res) => {
            const { eventId } = req.params;
            await this.eventService.deleteEvent(eventId);
            return res.status(200).json({
                message: 'Xóa sự kiện thành công',
            });
        };
        this.findEvent = async (req, res) => {
            const { eventId } = req.params;
            if (!eventId)
                throw new appError_1.AppError(400, 'Vui lòng cung cấp Event ID');
            const event = await this.eventService.getEvent(eventId);
            return res.status(200).json({ message: 'Lấy sự kiện thành công', data: { event } });
        };
        this.joinEvent = async (req, res) => {
            const { eventId } = req.params;
            const userId = req.user.id;
            await this.eventService.joinEvent(eventId, userId);
            return res.status(201).json({
                message: 'Tham gia sự kiện thành công!',
            });
        };
        this.kickUser = async (req, res) => {
            const { eventId, userId } = req.params;
            const currentUser = req.user;
            // Nếu user tự thoát thì userId = req.user.id
            // Nếu Admin đá user thì lấy userId từ params
            if (currentUser.role !== client_1.Role.ADMIN && currentUser.id !== userId) {
                throw new appError_1.AppError(403, 'Bạn không có quyền đuổi người dùng khỏi sự kiện');
            }
        };
        this.addParticipantByAdmin = async (req, res) => {
            const { eventId } = req.params;
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: "UserId là bắt buộc" });
            }
            await this.eventService.addParticipantByAdmin(eventId, userId);
            return res.status(201).json({
                message: 'Thêm người dùng vào sự kiện thành công!',
            });
        };
        this.getParticipants = async (req, res) => {
            const { eventId } = req.params;
            const participants = await this.eventService.getParticipants(eventId);
            return res.status(200).json({ data: participants });
        };
        this.getAllEvent = async (req, res) => {
            let { page, limit, status } = req.query;
            const pageNum = parseInt(page || '1');
            const limitNum = parseInt(limit || '10');
            // If status is provided, validate it. If not, pass as undefined to let repository handle it (show all)
            if (status && status !== client_1.EventStatus.ENDED && status !== client_1.EventStatus.ONGOING && status !== client_1.EventStatus.PENDING) {
                return res.status(400).json({ message: "Trạng thái sự kiện không hợp lệ" });
            }
            const events = await this.eventService.getAllEvents(pageNum, limitNum, status);
            return res.status(200).json({
                message: "Lấy danh sách sự kiện thành công",
                data: events
            });
        };
    }
}
exports.EventController = EventController;
