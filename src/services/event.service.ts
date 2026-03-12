import { EventRepository } from "../repositories/event.repository";

export class EventService {
  private eventRepo = new EventRepository();

  public createEvent = async (data: any) => {
    if (new Date(data.start_time) < new Date()) throw new Error("INVALID_START_TIME_PAST");
    if (new Date(data.start_time) > new Date(data.end_time)) throw new Error("INVALID_TIME_RANGE");

    return await this.eventRepo.create(data);
  };

  public updateEvent = async (id: string, data: any) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error("EVENT_NOT_FOUND");

    // Nếu có cập nhật thời gian thì mới validate lại
    if (data.start_time || data.end_time) {
      const start = data.start_time || existingEvent.start_time;
      const end = data.end_time || existingEvent.end_time;

      if (new Date(start) < new Date()) throw new Error("INVALID_START_TIME_PAST");
      if (new Date(start) > new Date(end)) throw new Error("INVALID_TIME_RANGE");
    }

    return await this.eventRepo.update(id, data);
  };

  public deleteEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error("EVENT_NOT_FOUND");

    return await this.eventRepo.delete(id);
  };

  public getEvent = async (id: string) => {
    const existingEvent = await this.eventRepo.findById(id);
    if (!existingEvent) throw new Error("EVENT_NOT_FOUND");

    return await this.eventRepo.findById(id);
  }
}