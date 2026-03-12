import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';

export class ItemController {
  private itemService = new ItemService();

  public getItemsByEvent = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const items = await this.itemService.getItemsByEvent(eventId as string);

      return res.status(200).json({ items });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({
          message: 'Sự kiện không tồn tại!',
        });
      }
      return res.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      });
    }
  };

  public getItemDetail = async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;

      const item = await this.itemService.getItemDetail(itemId as string);

      return res.status(200).json(item);
    } catch (error: any) {
      if (error.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({
          message: 'Vật phẩm không tồn tại!',
        });
      }
      return res.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      });
    }
  };

  public createItem = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const primary_image = files?.['primary_image']?.[0]?.path; // Lấy URL ảnh chính
      const images = files?.['images']?.map((file) => file.path); // Lấy mảng URL ảnh phụ

      const itemData = {
        ...req.body,
        primary_image: primary_image,
        images: images,
      };

      if (!itemData.name || !itemData.start_price || !itemData.step_price) {
        return res.status(400).json({
          message: 'Vui lòng nhập đầy đủ tên và giá!',
        });
      }

      const newItem = await this.itemService.createItem(eventId as string, itemData);

      return res.status(201).json({
        message: 'Thêm vật phẩm thành công',
        data: newItem,
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({
          message: 'Sự kiện không tồn tại!',
        });
      }

      if (error.message === 'EVENT_NOT_PENDING') {
        return res.status(400).json({
          message: 'Chỉ có thể thêm vật phẩm khi sự kiện chưa bắt đầu',
        });
      }
      return res.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      });
    }
  };

  public updateItem = async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const primary_image = files?.['primary_image']?.[0]?.path;
      const images = files?.['images']?.map((file) => file.path);

      const updateData = { ...req.body };
      if (primary_image) {
        updateData.primary_image = primary_image;
      }
      if (images) {
        updateData.images = images;
      }

      const updatedItem = await this.itemService.updateItem(itemId as string, updateData);
      return res.status(200).json({
        message: 'Cập nhật thành công',
        data: updatedItem,
      });
    } catch (error: any) {
      if (error.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({
          message: 'Vật phẩm không tồn tại',
        });
      }
      if (error.message === 'ITEM_NOT_WAITING') {
        return res.status(400).json({
          message: 'Không thể sửa vật phẩm đang hoặc đã đấu giá',
        });
      }
      return res.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      });
    }
  };

  public deleteItem = async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;

      await this.itemService.deleteItem(itemId as string);

      return res.status(200).json({
        message: 'Xóa vật phẩm thành công',
      });
    } catch (error: any) {
      if (error.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({
          message: 'Vật phẩm không tồn tại',
        });
      }
      if (error.message === 'ITEM_NOT_WAITING') {
        return res.status(400).json({
          message: 'Không thể xóa vật phẩm đang hoặc đã đấu giá',
        });
      }
      return res.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      });
    }
  };
}
