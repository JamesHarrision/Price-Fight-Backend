import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { EventService } from '../services/event.service';
import { EventStatus, Role } from '@prisma/client';
import { AppError } from '../utils/appError';

export class EventController {
  private eventService = new EventService();

  public createEvent = async (req: AuthRequest, res: Response) => {
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

  public updateEvent = async (req: AuthRequest, res: Response) => {
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
  };

  public deleteEvent = async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;
    await this.eventService.deleteEvent(eventId as string);

    return res.status(200).json({
      message: 'Xóa sự kiện thành công',
    });
  };

  public findEvent = async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;
    if (!eventId) throw new AppError(400, 'Vui lòng cung cấp Event ID');

    const event = await this.eventService.getEvent(eventId as string);

    return res.status(200).json({ message: 'Lấy sự kiện thành công', data: { event } });
  };

  public joinEvent = async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    await this.eventService.joinEvent(eventId as string, userId);

    return res.status(201).json({
      message: 'Tham gia sự kiện thành công!',
    });
  };

  public kickUser = async (req: AuthRequest, res: Response) => {
    const { eventId, userId } = req.params;
    const currentUser = req.user;
    // Nếu user tự thoát thì userId = req.user.id
    // Nếu Admin đá user thì lấy userId từ params

    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new AppError(403, 'Bạn không có quyền đuổi người dùng khỏi sự kiện');
    }
  };

  public addParticipantByAdmin = async (req: AuthRequest, res: Response) => {

    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId là bắt buộc" });
    }

    await this.eventService.addParticipantByAdmin(eventId as string, userId as string);

    return res.status(201).json({
      message: 'Thêm người dùng vào sự kiện thành công!',
    });
  };

  public getParticipants = async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;
    const participants = await this.eventService.getParticipants(eventId as string);
    return res.status(200).json({ data: participants });
  };

  public getAllEvent = async (req: AuthRequest, res: Response) => {
    let { page, limit, status } = req.query as { page?: string, limit?: string, status?: string };

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');

    // If status is provided, validate it. If not, pass as undefined to let repository handle it (show all)
    if (status && status !== EventStatus.ENDED && status !== EventStatus.ONGOING && status !== EventStatus.PENDING) {
      return res.status(400).json({ message: "Trạng thái sự kiện không hợp lệ" });
    }

    const events = await this.eventService.getAllEvents(
      pageNum,
      limitNum,
      status as EventStatus
    );

    return res.status(200).json({
      message: "Lấy danh sách sự kiện thành công",
      data: events
    })
  };
}
