import { BidRepository } from '../repositories/bid.repository';
import { EventRepository } from '../repositories/event.repository';
import { ItemRepository } from '../repositories/item.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';
import { UserRepository } from '../repositories/user.repository';
import { getDate, parseDate } from '../utils/day.util';
import { AppError } from '../utils/appError';

export class EventService {
  private eventRepo = new EventRepository();
  private itemRepo = new ItemRepository();
  private bidRepo = new BidRepository();
  private userRepo = new UserRepository();

  public createEvent = async (data: any) => {
    const start = parseDate(data.start_time);
    const end = parseDate(data.end_time);

    if (start < getDate()) throw new AppError(400, 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
    if (start > end) throw new AppError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu');

    const formattedData = {
      ...data,
      start_time: start,
      end_time: end,
      cover_image: data.cover_image || null
    };

    return await this.eventRepo.create(formattedData);
  };

  public updateEvent = async (id: string, data: any) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new AppError(404, 'Sự kiện không tồn tại');

    const updateData = { ...data };

    // Convert datetime strings sang Date object cho Prisma
    if (updateData.start_time) updateData.start_time = parseDate(updateData.start_time);
    if (updateData.end_time) updateData.end_time = parseDate(updateData.end_time);

    // Nếu có cập nhật thời gian thì mới validate lại
    if (data.start_time || data.end_time) {
      const start = updateData.start_time || existingEvent.start_time;
      const end = updateData.end_time || existingEvent.end_time;

      if (start > end)
        throw new AppError(400, 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    }

    if (existingEvent.cover_image && data.cover_image) {
      await deleteImageFromCloudinary(existingEvent.cover_image);
    }

    return await this.eventRepo.update(id, updateData);
  };

  public deleteEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new AppError(404, 'Không tìm thấy sự kiện');

    const items = (await this.itemRepo.getItemsByEventId(id)).items;
    await Promise.all(
      items.map(async (item) => {
        const imagesToDelete: string[] = [];
        if (item.images) {
          imagesToDelete.push(...(item.images as string[]));
        }
        await Promise.all(imagesToDelete.map(async (image) => deleteImageFromCloudinary(image)));
      }),
    );

    if (existingEvent.cover_image) {
      await deleteImageFromCloudinary(existingEvent.cover_image);
    }

    return await this.eventRepo.delete(id);
  };

  public getEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new AppError(404, 'Không tìm thấy sự kiện');

    return await this.eventRepo.findById(id);
  };

  public removeUserFromEvent = async (eventId: string, userId: string) => {
    const isWinner = await this.itemRepo.getItemByWinnerId(eventId, userId);
    if (isWinner)
      throw new AppError(400, 'Không thể xóa: Người dùng đang là người thắng cuộc của vật phẩm trong sự kiện này.');

    const hasBids = await this.bidRepo.getBidByUserAndEvent(userId, eventId);
    if (hasBids) throw new AppError(400, 'Không thể xóa: Người dùng đã tham gia đấu giá trong sự kiện này.');

    const participant = await this.eventRepo.getEventUserById(eventId, userId);
    if (!participant) throw new AppError(404, 'Người dùng chưa tham gia sự kiện này.');

    await this.eventRepo.kickUserOutEvent(eventId, userId);
    return true;
  }

  public addParticipantByAdmin = async (eventId: string, userId: string) => {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new AppError(404, "Sự kiện không tồn tại");

    const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
    if (isJoined) throw new AppError(400, "Đã tham gia sự kiện");

    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new AppError(404, "Người dùng không tồn tại");

    return await this.eventRepo.addParticipant(eventId, userId);
  };

  public joinEvent = async (eventId: string, userId: string) => {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new AppError(404, 'Không tìm thấy sự kiện');
    }
    if (event.status === 'ENDED') {
      throw new AppError(400, 'Sự kiện đã kết thúc, không thể tham gia');
    }

    const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
    if (isJoined) {
      throw new AppError(400, 'Bạn đã tham gia sự kiện này rồi');
    }

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'Không tìm thấy người dùng');
    }

    const { items } = await this.itemRepo.getItemsByEventId(eventId);
    if (items.length > 0) {
      const minPrice = Math.min(...items.map((item) => Number(item.start_price)));

      if (Number(user.balance) < minPrice) {
        throw new AppError(
          400,
          `Số dư của bạn không đủ! Cần ít nhất ${Number(minPrice).toLocaleString('vi-VN')}đ (giá của vật phẩm rẻ nhất) để tham gia phòng này.`,
        );
      }
    }

    return await this.eventRepo.addParticipant(eventId, userId);
  };

  public getAllEvents = async (page: number = 1, limit: number = 10, status: string) => {
    if (page <= 0 || limit <= 0) throw new AppError(400, "Truy vấn không hợp lệ");
    return await this.eventRepo.getAllEvents(page, limit, status);
  }

  public getParticipants = async (eventId: string) => {
    return await this.eventRepo.getParticipantsByEventId(eventId);
  };
}
