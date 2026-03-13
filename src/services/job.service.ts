import { TokenRepository } from '../repositories/token.repository';

export class JobService {
  private tokenRepo = new TokenRepository();

  public cleanupExpiredTokens = async () => {
    try {
      console.log('⏳ [Job] Bắt đầu dọn dẹp token hết hạn...');
      const result = await this.tokenRepo.deleteExpiredTokens();
      console.log(`✅ [Job] Dọn dẹp thành công. Đã xóa ${result.count} token rác.`);
      return result.count;
    } catch (error) {
      console.error('❌ [Job] Lỗi khi dọn dẹp token:', error);
      throw error;
    }
  };
}
