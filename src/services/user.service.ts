import { UserRepository } from "../repositories/user.repository";
import { deleteImageFromCloudinary } from "../utils/cloudinary.util";

export class UserService {
  private userRepo = new UserRepository();

  public getMe = async (userId: string) => {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public updateMe = async (userId: string, data: any) => {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.avatar_url && data.avatar_url) {
      await deleteImageFromCloudinary(user.avatar_url);
    }

    const updatedUser = await this.userRepo.updateUser(userId, data);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public deposit = async (userId: string, amount: number) => {
    if (amount <= 0) {
      throw new Error('INVALID_AMOUNT');
    }
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    const newBalance = Number(user.balance) + amount;

    const updatedUser = await this.userRepo.updateUser(userId, { balance: newBalance });
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public getAllUsers = async (page: number = 1, limit: number = 10, search?: string) => {
    const skip = (page - 1) * limit;
    const { users, total } = await this.userRepo.getAllUsers(skip, limit, search);
    return {
      data: users.map(({ password, ...rest }) => rest),
      pagination: {
        total_items: total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        limit: limit,
      },
    };
  };
}