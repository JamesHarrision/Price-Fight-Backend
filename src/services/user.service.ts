import { UserRepository } from '../repositories/user.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';
import { AppError } from '../utils/appError';

export class UserService {
  private userRepo = new UserRepository();

  public getMe = async (userId: string) => {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new AppError(404, 'Không tìm thấy người dùng');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  };

  public updateMe = async (userId: string, data: any) => {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new AppError(404, 'Không tìm thấy người dùng');

    if (user.avatar_url && data.avatar_url) {
      await deleteImageFromCloudinary(user.avatar_url);
    }

    const updatedUser = await this.userRepo.updateUser(userId, data);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  };

  public deposit = async (userId: string, amount: number) => {
    if (amount <= 0) {
      throw new AppError(400, 'Số tiền nạp phải lớn hơn 0');
    }
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
    const newBalance = Number(user.balance) + amount;

    const updatedUser = await this.userRepo.updateUser(userId, { balance: newBalance });
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  };
}
