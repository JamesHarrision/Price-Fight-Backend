"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const prisma_config_1 = require("../config/prisma.config");
class ItemRepository {
    constructor() {
        this.getItemsByEventId = async (eventId, skip, take) => {
            const [items, total] = await Promise.all([
                prisma_config_1.prisma.auctionItem.findMany({
                    where: { event_id: eventId },
                    orderBy: { name: 'asc' }, // Sắp xếp theo tên A-Z
                    skip: skip,
                    take: take,
                }),
                prisma_config_1.prisma.auctionItem.count({
                    where: { event_id: eventId },
                }),
            ]);
            return { items, total };
        };
        this.getItemById = async (itemId) => {
            return await prisma_config_1.prisma.auctionItem.findUnique({
                where: { id: itemId },
            });
        };
        this.createItem = async (data) => {
            return await prisma_config_1.prisma.auctionItem.create({
                data: data,
            });
        };
        this.updateItem = async (itemId, data) => {
            return await prisma_config_1.prisma.auctionItem.update({
                where: { id: itemId },
                data: data,
            });
        };
        this.deleteItem = async (itemId) => {
            return await prisma_config_1.prisma.auctionItem.delete({
                where: { id: itemId },
            });
        };
        this.getItemByWinnerId = async (eventId, userId) => {
            return await prisma_config_1.prisma.auctionItem.findFirst({
                where: {
                    event_id: eventId,
                    winner_id: userId,
                },
            });
        };
        this.getInventoryItems = async (skip, take, search, status, unassignedOnly) => {
            const where = {};
            if (unassignedOnly) {
                where.event_id = null;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status) {
                where.status = status;
            }
            const [items, total] = await Promise.all([
                prisma_config_1.prisma.auctionItem.findMany({
                    where: where,
                    orderBy: { name: 'asc' },
                    skip: skip,
                    take: take,
                }),
                prisma_config_1.prisma.auctionItem.count({
                    where: where,
                }),
            ]);
            return { items, total };
        };
    }
}
exports.ItemRepository = ItemRepository;
