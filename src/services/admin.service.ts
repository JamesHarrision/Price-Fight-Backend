import { prisma } from '../config/prisma.config';

export class AdminService {
  public getStats = async () => {
    const [totalRevenue, activeUsers, ongoingBids, liveItems] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      prisma.user.count(),
      prisma.bidHistory.count(),
      prisma.auctionItem.count({
        where: { status: 'LIVE' }
      })
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      activeUsers,
      ongoingBids,
      liveItems
    };
  };

  public updateUser = async (userId: string, data: any) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  };
}
