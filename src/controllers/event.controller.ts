import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { EventService } from "../services/event.service";
import { EventStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma.config";
import { stat } from "node:fs";

export class EventController {
  private eventService = new EventService();

  public createEvent = async (req: AuthRequest, res: Response) => {
    try {
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
    } catch (error: any) {
      if (error.message === 'INVALID_START_TIME_PAST') {
        return res.status(401).json({ message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại' });
      } else if (error.message === 'INVALID_TIME_RANGE') {
        return res.status(401).json({ message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu' });
      }
      console.log(error);
      return res.status(500).json({ message: 'Lỗi nội bộ của server' });
    }
  };

  public updateEvent = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const { title, description, start_time, end_time } = req.body;

      let cover_image = '';
      if (req.file) {
        cover_image = req.file.path;
      }

      const updateData: any = { title, description, start_time, end_time, cover_image };
      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

      const event = await this.eventService.updateEvent(eventId as string, updateData);

      return res.status(201).json({
        message: 'Cập nhật sự kiện thành công',
        data: event,
      });
    } catch (error: any) {
      if (error.message === 'INVALID_START_TIME_PAST') {
        return res.status(401).json({ message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại' });
      } else if (error.message === 'INVALID_TIME_RANGE') {
        return res.status(401).json({ message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu' });
      }
      console.log(error);
      return res.status(500).json({ message: 'Lỗi nội bộ của server' });
    }
  };

  public deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      await this.eventService.deleteEvent(eventId as string);

      return res.status(200).json({
        message: 'Xóa sự kiện thành công',
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
      }
      console.log(error);
      return res.status(500).json({ message: 'Lỗi nội bộ của server' });
    }
  };

  public findEvent = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      if (!eventId) throw new Error('NOT_FOUND');

      const event = await this.eventService.getEvent(eventId as string);

      return res.status(200).json({ message: 'Lấy sự kiện thành công', data: { event } });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND' || error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json('Sự kiện không tồn tại');
      }
      console.log(error);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  };

  public joinEvent = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      await this.eventService.joinEvent(eventId as string, userId);

      return res.status(201).json({
        message: 'Tham gia sự kiện thành công!',
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({
          message: 'Sự kiện không tồn tại',
        });
      }
      if (error.message === 'EVENT_ENDED') {
        return res.status(400).json({
          message: 'Sự kiện đã kết thúc, không thể tham gia',
        });
      }
      if (error.message === 'ALREADY_JOINED') {
        return res.status(400).json({
          message: 'Bạn đã tham gia sự kiện này rồi',
        });
      }
      if (error.message.startsWith('INSUFFICIENT_BALANCE')) {
        const minPrice = error.message.split(':')[1];
        return res.status(400).json({
          message: `Số dư của bạn không đủ! Cần ít nhất ${Number(minPrice).toLocaleString('vi-VN')}đ (giá của vật phẩm rẻ nhất) để tham gia phòng này.`,
        });
      }

      console.log(error);
      return res.status(500).json({
        message: 'Lỗi nội bộ của server!',
      });
    }
  };

  public kickUser = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId, userId } = req.params;
      const currentUser = req.user;
      // Nếu user tự thoát thì userId = req.user.id
      // Nếu Admin đá user thì lấy userId từ params

      if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
        return res.status(403).json({ message: "Bạn không có quyền đuổi người dùng khỏi sự kiện" });
      }

      await this.eventService.removeUserFromEvent(eventId as string, userId as string);

      return res.status(200).json({ message: "Đã rời khỏi sự kiện thành công" });
    } catch (error: any) {
      if (error.message === 'CANNOT_REMOVE_WINNER') {
        return res.status(400).json({ message: "Không thể xóa: Người dùng đang là người thắng cuộc của vật phẩm trong sự kiện này." });
      }
      if (error.message === 'CANNOT_REMOVE_BIDDER') {
        return res.status(400).json({ message: "Không thể xóa: Người dùng đã tham gia đấu giá trong sự kiện này." });
      }
      if (error.message === 'PARTICIPANT_NOT_FOUND') {
        return res.status(404).json({ message: "Người dùng chưa tham gia sự kiện này." });
      }

      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  public getAllEvent = async (req: AuthRequest, res: Response) => {
    try {
      let { page, limit, status } = req.query;

      if (status !== EventStatus.ENDED && status !== EventStatus.ONGOING && status !== EventStatus.PENDING) {
        throw new Error("INVALID STATUS")
      }

      const events = await this.eventService.getAllEvents(
        parseInt(page as string),
        parseInt(limit as string),
        status);

      return res.status(200).json({
        message: "Lấy danh sách sự kiện thành công",
        data: events
      })
    } catch (error: any) {
      console.log(error);
      if (error.message) return res.status(401).json({ message: "INVALID QUERY" });
      return res.status(500).json({ message: "Lỗi nội bộ của server" });
    }
  }
}