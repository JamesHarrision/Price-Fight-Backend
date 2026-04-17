import { prisma } from '../config/prisma.config';
import { AppError } from '../utils/appError';

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
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  };
}
