"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const token_repository_1 = require("../repositories/token.repository");
class JobService {
    constructor() {
        this.tokenRepo = new token_repository_1.TokenRepository();
        this.cleanupExpiredTokens = async () => {
            try {
                console.log('⏳ [Job] Bắt đầu dọn dẹp token hết hạn...');
                const result = await this.tokenRepo.deleteExpiredTokens();
                console.log(`✅ [Job] Dọn dẹp thành công. Đã xóa ${result.count} token rác.`);
                return result.count;
            }
            catch (error) {
                console.error('❌ [Job] Lỗi khi dọn dẹp token:', error);
                throw error;
            }
        };
    }
}
exports.JobService = JobService;
