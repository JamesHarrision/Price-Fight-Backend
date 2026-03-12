import { prisma } from '../config/prisma.config';

export class EventRepository {
  // Lấy thông tin một sự kiện theo ID
  public getEventById = async (id: string) => {
    return await prisma.auctionEvent.findUnique({
      where: { id: id },
    });
  };
}
