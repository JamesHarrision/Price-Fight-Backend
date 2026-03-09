import { prisma } from "../config/prisma.config";

export class UserRepository {

  public getUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
      where: { email: email }
    })
  }

  public getUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: { id: id }
    })
  }

  public createUser = async (data: any) => {
    return await prisma.user.create({ data })
  }

  public deleteUser = async (id: string) => {
    return await prisma.user.delete({
      where: { id: id }
    })
  }

  public updateVerificationStatus = async (userId: string, isVerified: boolean) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        is_verified: isVerified
      }
    })
  }
}