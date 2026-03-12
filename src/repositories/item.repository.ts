import { prisma } from '../config/prisma.config';

export class ItemRepository {
  public getItemsByEventId = async (eventId: string) => {
    return await prisma.auctionItem.findMany({
      where: { event_id: eventId },
      orderBy: { name: 'asc' },
    });
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
}
