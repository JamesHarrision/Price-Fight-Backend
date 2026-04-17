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

  // --- Address Business Logic ---
  public getAddresses = async (userId: string) => {
    return await this.userRepo.getAddressesByUserId(userId);
  };

  public addAddress = async (userId: string, data: any) => {
    const existingAddresses = await this.userRepo.getAddressesByUserId(userId);
    const isFirst = existingAddresses.length === 0;

    return await this.userRepo.createAddress({
      ...data,
      user_id: userId,
      is_default: data.is_default !== undefined ? data.is_default : isFirst,
    });
  };

  public deleteAddress = async (userId: string, addressId: string) => {
    const address = await this.userRepo.getAddressById(addressId);
    if (!address) throw new AppError(404, 'Không tìm thấy địa chỉ');
    if (address.user_id !== userId) throw new AppError(403, 'Bạn không có quyền xóa địa chỉ này');

    await this.userRepo.deleteAddress(addressId);
    return { message: 'Xóa địa chỉ thành công' };
  };

  // --- Bids Business Logic ---
  public getMyBids = async (userId: string) => {
    return await this.userRepo.getMyBids(userId);
  };
}
