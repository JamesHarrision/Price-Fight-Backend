import { prisma } from '../config/prisma.config'

export class TokenRepository {

  public create = async (data: any) => {
    return await prisma.token.create({ data });
  }

  public findByToken = async (token: string) => {
    return await prisma.token.findUnique({ where: { token: token } })
  }

  public delete = async (tokenId: string) => {
    return await prisma.token.delete({ where: { id: tokenId } });
  }
  
}