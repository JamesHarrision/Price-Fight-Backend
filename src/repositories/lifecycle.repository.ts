import { EventStatus, ItemStatus } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export class LifeCycleRepository {


  public startEvent = async (event_id: string) => {
    return await prisma.$transaction(async (tx) => {
      await tx.auctionEvent.updateMany({
        where: {
          id: event_id
        },
        data: { status: EventStatus.ONGOING }
      });

      await tx.auctionItem.updateMany({
        where: {
          event_id: event_id
        },
        data: { status: ItemStatus.LIVE }
      })
    })
  }
}