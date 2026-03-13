import { prisma } from '../config/prisma.config';

export class ItemRepository {
  public getItemsByEventId = async (eventId: string, skip?: number, take?: number) => {
    const [items, total] = await Promise.all([
      prisma.auctionItem.findMany({
        where: { event_id: eventId },
        orderBy: { name: 'asc' }, // Sắp xếp theo tên A-Z
        skip: skip,
        take: take,
      }),
      prisma.auctionItem.count({
        where: { event_id: eventId },
      }),
    ]);

    return { items, total };
  };

  public getItemById = async (itemId: string) => {
    return await prisma.auctionItem.findUnique({
      where: { id: itemId },
    });
  };

  public createItem = async (data: any) => {
    return await prisma.auctionItem.create({
      data: data,
    });
  };

  public updateItem = async (itemId: string, data: any) => {
    return await prisma.auctionItem.update({
      where: { id: itemId },
      data: data,
    });
  };

  public deleteItem = async (itemId: string) => {
    return await prisma.auctionItem.delete({
      where: { id: itemId },
    });
  };

  public getItemByWinnerId = async (eventId: string, userId: string) => {
    return await prisma.auctionItem.findFirst({
      where: {
        event_id: eventId,
        winner_id: userId
      }
    })
  }
}
