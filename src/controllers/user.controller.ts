import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

export class UserController {
  private userService = new UserService();

  public getMe = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const user = await this.userService.getMe(userId);

    return res.status(200).json({ data: user });
  };

  public updateMe = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { full_name } = req.body;
    let avatar_url;

    // Nếu có upload file từ Cloudinary
    if (req.file) {
      avatar_url = req.file.path;
    }

    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (avatar_url) updateData.avatar_url = avatar_url;

    const updatedUser = await this.userService.updateMe(userId, updateData);

    return res.status(200).json({
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedUser,
    });
  };

  public getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
      const { page, limit, search } = req.query;
      const result = await this.userService.getAllUsers(
        Number(page || 1),
        Number(limit || 10),
        search as string
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };

  public deposit = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount))) {
      throw new AppError(400, 'Số tiền nạp không hợp lệ');
    }

    const updatedUser = await this.userService.deposit(userId, Number(amount));

    return res.status(200).json({
      message: 'Nạp tiền vào ví thành công',
      balance: updatedUser.balance,
    });
  };
}
