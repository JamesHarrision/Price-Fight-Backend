import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  private userService = new UserService();

  public getMe = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await this.userService.getMe(userId);

      return res.status(200).json({ data: user });
    } catch (error: any) {
      console.log(error);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  };

  public updateMe = async (req: AuthRequest, res: Response) => {
    try {
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
        data: updatedUser
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };

  public deposit = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' });
      }

      const updatedUser = await this.userService.deposit(userId, Number(amount));

      return res.status(200).json({
        message: 'Nạp tiền vào ví thành công',
        balance: updatedUser.balance
      });
    } catch (error: any) {
      if (error.message === 'INVALID_AMOUNT') {
        return res.status(400).json({ message: 'Số tiền nạp phải lớn hơn 0' });
      }
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };
}