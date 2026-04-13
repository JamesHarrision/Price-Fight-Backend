import { prisma } from '../config/prisma.config';

export class UserRepository {
  public getUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
      where: { email: email },
    });
  };

  public getUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: { id: id },
    });
  };

  public createUser = async (data: any) => {
    return await prisma.user.create({ data });
  };

  public deleteUser = async (id: string) => {
    return await prisma.user.delete({
      where: { id: id },
    });
  };

  public updateVerificationStatus = async (userId: string, isVerified: boolean) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified: isVerified,
      },
    });
  };

  public updatePassword = async (userId: string, hashedNewPassword: string) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });
  };

  public updateUser = async (userId: string, data: any) => {
    return await prisma.user.update({
      where: { id: userId },
      data: data
    })
  };

  public getAllUsers = async (skip: number = 0, take: number = 10, search?: string) => {
    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: { full_name: 'asc' }
      }),
      prisma.user.count({ where: whereCondition })
    ]);

    return { users, total };
  };

  // --- Address Management ---
  public getAddressesByUserId = async (userId: string) => {
    return await prisma.address.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  };

  public createAddress = async (data: any) => {
    return await prisma.address.create({ data });
  };

  public getAddressById = async (addressId: string) => {
    return await prisma.address.findUnique({
      where: { id: addressId },
    });
  };

  public deleteAddress = async (addressId: string) => {
    return await prisma.address.delete({
      where: { id: addressId },
    });
  };
}
