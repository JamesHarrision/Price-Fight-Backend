import { BidRepository } from '../repositories/bid.repository';
import { EventRepository } from '../repositories/event.repository';
import { ItemRepository } from '../repositories/item.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';
import { UserRepository } from '../repositories/user.repository';
import { getDate, parseDate } from '../utils/day.util';

export class EventService {
  private eventRepo = new EventRepository();
  private itemRepo = new ItemRepository();
  private bidRepo = new BidRepository();
  private userRepo = new UserRepository();

  public createEvent = async (data: any) => {
    const start = parseDate(data.start_time);
    const end = parseDate(data.end_time);

    if (start < getDate()) throw new Error('INVALID_START_TIME_PAST');
    if (start > end) throw new Error('INVALID_TIME_RANGE');

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
    if (!existingEvent) throw new Error('EVENT_NOT_FOUND');

    const updateData = { ...data };

    // Nếu có cập nhật thời gian thì mới validate lại
    if (data.start_time || data.end_time) {
      const start = parseDate(data.start_time || existingEvent.start_time);
      const end = parseDate(data.end_time || existingEvent.end_time);

      if (start < getDate()) throw new Error('INVALID_START_TIME_PAST');
      if (start > end) throw new Error('INVALID_TIME_RANGE');

      if (data.start_time) updateData.start_time = start;
      if (data.end_time) updateData.end_time = end;
    }

    if (data.cover_image === '') {
      updateData.cover_image = null;
    }

    if (existingEvent.cover_image && data.cover_image) {
      await deleteImageFromCloudinary(existingEvent.cover_image);
    }

    return await this.eventRepo.update(id, updateData);
  };

  public deleteEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error('EVENT_NOT_FOUND');

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
    if (!existingEvent) throw new Error('EVENT_NOT_FOUND');

    return await this.eventRepo.findById(id);
  };

  public removeUserFromEvent = async (eventId: string, userId: string) => {
    const isWinner = await this.itemRepo.getItemByWinnerId(eventId, userId);
    if (isWinner) throw new Error('CANNOT_REMOVE_WINNER');

    const hasBids = await this.bidRepo.getBidByUserAndEvent(userId, eventId);
    if (hasBids) throw new Error('CANNOT_REMOVE_BIDDER');

    const participant = await this.eventRepo.getEventUserById(eventId, userId);
    if (!participant) throw new Error('PARTICIPANT_NOT_FOUND');

    await this.eventRepo.kickUserOutEvent(eventId, userId);
    return true;
  }

  public addParticipantByAdmin = async (eventId: string, userId: string) => {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new Error('EVENT_NOT_FOUND');

    const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
    if (isJoined) throw new Error('ALREADY_JOINED');

    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    return await this.eventRepo.addParticipant(eventId, userId);
  };

  public joinEvent = async (eventId: string, userId: string) => {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }
    if (event.status === 'ENDED') {
      throw new Error('EVENT_ENDED');
    }

    const isJoined = await this.eventRepo.checkParticipant(eventId, userId);
    if (isJoined) {
      throw new Error('ALREADY_JOINED');
    }

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const { items } = await this.itemRepo.getItemsByEventId(eventId);
    if (items.length > 0) {
      const minPrice = Math.min(...items.map((item) => Number(item.start_price)));

      if (Number(user.balance) < minPrice) {
        throw new Error(`INSUFFICIENT_BALANCE:${minPrice}`);
      }
    }

    return await this.eventRepo.addParticipant(eventId, userId);
  };

  public getAllEvents = async (page: number = 1, limit: number = 10, status: string) => {
    if (page <= 0 || limit <= 0) throw new Error("INVALID_QUERY");
    return await this.eventRepo.getAllEvents(page, limit, status);
  }

  public getParticipants = async (eventId: string) => {
    return await this.eventRepo.getParticipantsByEventId(eventId);
  };
}
