"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const prisma_config_1 = require("./../config/prisma.config");
const client_1 = require("@prisma/client");
class TransactionRepository {
    constructor() {
        this.getUserTransactions = async (userId) => {
            return await prisma_config_1.prisma.transaction.findMany({
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
        this.getTransactionById = async (transactionId) => {
            return await prisma_config_1.prisma.transaction.findUnique({
                where: { id: transactionId },
                include: { item: true },
            });
        };
        this.payTransaction = async (transactionId, userId, itemId, amount) => {
            return await prisma_config_1.prisma.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: amount } },
                });
                const updatedTransaction = await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: client_1.TransactionStatus.PAID },
                });
                const updatedItem = await tx.auctionItem.update({
                    where: { id: itemId },
                    data: { status: client_1.ItemStatus.SOLD },
                });
                return { updatedTransaction, updatedItem, currentBalance: updatedUser.balance };
            });
        };
        this.getExpiredPendingTransactions = async (expiryDate) => {
            return await prisma_config_1.prisma.transaction.findMany({
                where: {
                    status: client_1.TransactionStatus.PENDING,
                    created_at: { lt: expiryDate },
                },
            });
        };
        this.cancelTransaction = async (transactionId, itemId) => {
            return await prisma_config_1.prisma.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: client_1.TransactionStatus.FAILED },
                });
                await tx.auctionItem.update({
                    where: { id: itemId },
                    data: { status: client_1.ItemStatus.UNSOLD },
                });
            });
        };
    }
}
exports.TransactionRepository = TransactionRepository;
