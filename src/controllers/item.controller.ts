import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';

export class ItemController {
  private itemService = new ItemService();

  public getItemsByEvent = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100; // default high limit for admin detail view
      const result = await this.itemService.getItemsByEvent(eventId as string, page, limit);

      // result = { data: items[], pagination: {...} }
      return res.status(200).json({
        items: result.data,
        pagination: result.pagination
      });
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

  public getInventoryItems = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const unassignedOnly = req.query.unassignedOnly === 'true';

      const result = await this.itemService.getInventoryItems(page, limit, search, status, unassignedOnly);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: 'Lỗi server!',
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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      let images: string[] = [];
      let primary_image: string | null = null;

      if (Array.isArray(files)) {
        images = files.map(file => file.path);
      } else if (files && typeof files === 'object') {
        images = files['images']?.map(file => file.path) || [];
        primary_image = files['primary_image']?.[0]?.path || null;
      }

      // If no explicit primary_image, take first from images
      if (!primary_image && images.length > 0) {
        primary_image = images[0];
      }



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

      const newItem = await this.itemService.createItem(itemData, eventId as string);

      return res.status(201).json({
        message: eventId ? 'Thêm vật phẩm vào sự kiện thành công' : 'Thêm vật phẩm vào kho thành công',
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
      if (error.message === 'ITEM_NOT_WAITING_OR_UNSOLD') {
        return res.status(400).json({
          message: 'Chỉ có thể sửa vật phẩm đang chờ hoặc chưa bán được',
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
