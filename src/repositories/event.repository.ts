import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export class EventRepository {

  public create = async (
    data: Prisma.AuctionEventCreateInput
  ) => {
    return await prisma.auctionEvent.create({
      data
    });
  }

  public update = async (id: string, data: Prisma.AuctionEventUpdateInput) => {
    return await prisma.auctionEvent.update({
      where: { id },
      data
    });
  };

  public delete = async (id: string) => {
    return await prisma.auctionEvent.delete({
      where: { id }
    });
  };

  public findById = async (id: string) => {
    return await prisma.auctionEvent.findUnique({
      where: { id }
    });
  };
}