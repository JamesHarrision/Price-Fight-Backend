import { prisma } from '../config/prisma.config';

export class TokenRepository {
  public create = async (data: any) => {
    return await prisma.token.create({ data });
  };

  public findByToken = async (token: string) => {
    return await prisma.token.findUnique({ where: { token: token } });
  };

  public delete = async (tokenId: string) => {
    return await prisma.token.delete({ where: { id: tokenId } });
  };

  public findValidOTP = async (userId: string, otp: string, type: any) => {
    return await prisma.token.findFirst({
      where: {
        user_id: userId,
        token: otp,
        type: type,
      },
    });
  };

  public deleteExpiredTokens = async () => {
    return await prisma.token.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  };
}
