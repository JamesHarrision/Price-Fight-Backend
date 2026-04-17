"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_config_1 = require("../config/prisma.config");
const day_util_1 = require("../utils/day.util");
class EventRepository {
    constructor() {
        this.create = async (data) => {
            return await prisma_config_1.prisma.auctionEvent.create({
                data,
            });
        };
        this.update = async (id, data) => {
            return await prisma_config_1.prisma.auctionEvent.update({
                where: { id },
                data,
            });
        };
        this.delete = async (id) => {
            return await prisma_config_1.prisma.auctionEvent.delete({
                where: { id },
            });
        };
        this.findById = async (id) => {
            return await prisma_config_1.prisma.auctionEvent.findUnique({
                where: { id },
                include: {
                    items: true,
                    _count: {
                        select: { participants: true }
                    }
                }
            });
        };
        this.checkParticipant = async (eventId, userId) => {
            return await prisma_config_1.prisma.eventParticipant.findUnique({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
            });
        };
        this.addParticipant = async (eventId, userId) => {
            return await prisma_config_1.prisma.eventParticipant.create({
                data: {
                    event_id: eventId,
                    user_id: userId,
                },
            });
        };
        this.getEventUserById = async (eventId, userId) => {
            return await prisma_config_1.prisma.eventParticipant.findUnique({
                where: {
                    event_id_user_id: { event_id: eventId, user_id: userId }
                }
            });
        };
        this.kickUserOutEvent = async (eventId, userId) => {
            return await prisma_config_1.prisma.eventParticipant.delete({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId
                    }
                }
            });
        };
        this.getAllEvents = async (page = 1, limit = 10, status) => {
            const skip = (page - 1) * limit;
            const whereCondition = {};
            if (status)
                whereCondition.status = status;
            const [event, total] = await Promise.all([
                await prisma_config_1.prisma.auctionEvent.findMany({
                    where: whereCondition,
                    skip: skip,
                    take: limit,
                    orderBy: { start_time: 'desc' }
                }),
                await prisma_config_1.prisma.auctionEvent.count({
                    where: whereCondition
                }),
            ]);
            return {
                data: event,
                pagination: {
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    page: page,
                    limit: limit
                }
            };
        };
        this.getPendingEvents = async () => {
            return await prisma_config_1.prisma.auctionEvent.findMany({
                where: {
                    status: client_1.EventStatus.PENDING,
                    start_time: {
                        lte: (0, day_util_1.getDate)()
                    }
                },
                include: {
                    items: true
                }
            });
        };
        this.getEndedOngoingEvents = async () => {
            return await prisma_config_1.prisma.auctionEvent.findMany({
                where: {
                    status: client_1.EventStatus.ONGOING,
                    end_time: {
                        lte: (0, day_util_1.getDate)()
                    }
                },
                include: {
                    items: true
                }
            });
        };
        this.getParticipantsByEventId = async (eventId) => {
            return await prisma_config_1.prisma.eventParticipant.findMany({
                where: { event_id: eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            avatar_url: true
                        }
                    }
                }
            });
        };
    }
}
exports.EventRepository = EventRepository;
