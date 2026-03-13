import { prisma } from "../config/prisma.config";

export class BidRepository {

  public getBidByUserAndEvent = async (
    userId: string,
    eventId: string
  ) => {
    return await prisma.bidHistory.findFirst({
      where: {
        user_id: userId,
        item: {
          event_id: eventId
        }
      }
    })
  }

}