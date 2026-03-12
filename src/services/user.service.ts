import { UserRepository } from "../repositories/user.repository";

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
}