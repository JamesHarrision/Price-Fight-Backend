import { EventStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.config';
import { getDate } from '../utils/day.util';

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

  public getEventUserById = async (eventId: string, userId: string) => {
    return await prisma.eventParticipant.findUnique({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId }
      }
    });
  }

  public kickUserOutEvent = async (eventId: string, userId: string) => {
    return await prisma.eventParticipant.delete({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId
        }
      }
    })
  }

  public getAllEvents = async (page: number = 1, limit: number = 10, status: string) => {
    const skip = (page - 1) * limit;
    const whereCondition: any = {}

    if (status) whereCondition.status = status;

    const [event, total] = await Promise.all([
      await prisma.auctionEvent.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { start_time: 'desc' }
      }),
      await prisma.auctionEvent.count({
        where: whereCondition
      }),
    ]);

    return {
      data: event,
      pagination: {
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        page: page,
        limit: limit
      }
    }
  }

  public getPendingEvents = async () => {
    return await prisma.auctionEvent.findMany({
      where: {
        status: EventStatus.PENDING,
        start_time: {
          lte: getDate()
        }
      },
      include: {
        items: true
      }
    });
  }
}
