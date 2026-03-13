import { EventRepository } from '../repositories/event.repository';
import { ItemRepository } from '../repositories/item.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';

export class EventService {
  private eventRepo = new EventRepository();
  private itemRepo = new ItemRepository();

  public createEvent = async (data: any) => {
    if (new Date(data.start_time) < new Date()) throw new Error('INVALID_START_TIME_PAST');
    if (new Date(data.start_time) > new Date(data.end_time)) throw new Error('INVALID_TIME_RANGE');

    return await this.eventRepo.create(data);
  };

  public updateEvent = async (id: string, data: any) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error('EVENT_NOT_FOUND');

    // Nếu có cập nhật thời gian thì mới validate lại
    if (data.start_time || data.end_time) {
      const start = data.start_time || existingEvent.start_time;
      const end = data.end_time || existingEvent.end_time;

      if (new Date(start) < new Date()) throw new Error('INVALID_START_TIME_PAST');
      if (new Date(start) > new Date(end)) throw new Error('INVALID_TIME_RANGE');
    }

    if (existingEvent.cover_image && data.cover_image) {
      await deleteImageFromCloudinary(existingEvent.cover_image);
    }

    return await this.eventRepo.update(id, data);
  };

  public deleteEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error('EVENT_NOT_FOUND');

    const items = (await this.itemRepo.getItemsByEventId(id)).items;
    await Promise.all((items).map(async (item) => {
      const imagesToDelete: string[] = [];
      if (item.images) {
        imagesToDelete.push(...item.images as string[]);
      }
      await Promise.all(
        imagesToDelete.map(async (image) => deleteImageFromCloudinary(image))
      )
    }));

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
}
