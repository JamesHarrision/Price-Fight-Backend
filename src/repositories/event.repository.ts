import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';

export class EventRepository {
  public create = async (data: Prisma.AuctionEventCreateInput) => {
    return await prisma.auctionEvent.create({
      data,
    });
  };

  public update = async (id: string, data: Prisma.AuctionEventUpdateInput) => {
    return await prisma.auctionEvent.update({
      where: { id },
      data,
    });
  };

  public delete = async (id: string) => {
    return await prisma.auctionEvent.delete({
      where: { id },
    });
  };

  public findById = async (id: string) => {
    return await prisma.auctionEvent.findUnique({
      where: { id },
    });
  };

  public checkParticipant = async (eventId: string, userId: string) => {
    return await prisma.eventParticipant.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });
  };

  public addParticipant = async (eventId: string, userId: string) => {
    return await prisma.eventParticipant.create({
      data: {
        event_id: eventId,
        user_id: userId,
      },
    });
  };
}
