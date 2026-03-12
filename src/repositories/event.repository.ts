import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export class EventRepository {

  public create = async (
    data: Prisma.AuctionEventCreateInput
  ) => {
    if (data.start_time < new Date()) throw new Error("INVALID_START_TIME_PAST");
    if (data.start_time > data.end_time) throw new Error("INVALID_TIME_RANGE");

    return await prisma.auctionEvent.create({
      data: {
        title: data.title,
        start_time: data.start_time,
        end_time: data.end_time,
        description: data.description,
        cover_image: data.cover_image
      }
    });
  }

}