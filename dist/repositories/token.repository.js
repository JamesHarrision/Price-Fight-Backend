"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const prisma_config_1 = require("../config/prisma.config");
const day_util_1 = require("../utils/day.util");
class TokenRepository {
    constructor() {
        this.create = async (data) => {
            return await prisma_config_1.prisma.token.create({ data });
        };
        this.findByToken = async (token) => {
            return await prisma_config_1.prisma.token.findUnique({ where: { token: token } });
        };
        this.delete = async (tokenId) => {
            return await prisma_config_1.prisma.token.delete({ where: { id: tokenId } });
        };
        this.findValidOTP = async (userId, otp, type) => {
            return await prisma_config_1.prisma.token.findFirst({
                where: {
                    user_id: userId,
                    token: otp,
                    type: type,
                },
            });
        };
        this.deleteExpiredTokens = async () => {
            return await prisma_config_1.prisma.token.deleteMany({
                where: {
                    expires_at: {
                        lt: (0, day_util_1.getDate)(),
                    },
                },
            });
        };
    }
}
exports.TokenRepository = TokenRepository;
