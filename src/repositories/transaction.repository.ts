import { prisma } from './../config/prisma.config';
import { ItemStatus, TransactionStatus } from '@prisma/client';

export class TransactionRepository {
  public getUserTransactions = async (userId: string) => {
    return await prisma.transaction.findMany({
      where: { user_id: userId },
      include: {
        item: {
          include: {
            event: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  };

  public getTransactionById = async (transactionId: string) => {
    return await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { item: true },
    });
  };

  public payTransaction = async (transactionId: string, userId: string, itemId: string, amount: number) => {
    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      });

      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.PAID },
      });

      const updatedItem = await tx.auctionItem.update({
        where: { id: itemId },
        data: { status: ItemStatus.SOLD },
      });

      return { updatedTransaction, updatedItem, currentBalance: updatedUser.balance };
    });
  };

  public getExpiredPendingTransactions = async (expiryDate: Date) => {
    return await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.PENDING,
        created_at: { lt: expiryDate },
      },
    });
  };

  public cancelTransaction = async (transactionId: string, itemId: string) => {
    return await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.FAILED },
      });

      await tx.auctionItem.update({
        where: { id: itemId },
        data: { status: ItemStatus.UNSOLD },
      });
    });
  };
}
