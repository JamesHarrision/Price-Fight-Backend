import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { AppError } from '../utils/appError';

export class ItemController {
  private itemService = new ItemService();

  public getItemsByEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const items = await this.itemService.getItemsByEvent(eventId as string, page, limit);

    return res.status(200).json({ items });
  };


  public getInventoryItems = async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const unassignedOnly = req.query.unassignedOnly === 'true';

      const result = await this.itemService.getInventoryItems(page, limit, search, status, unassignedOnly);
    return res.status(200).json(result);
  };

  public getItemDetail = async (req: Request, res: Response) => {
    const { itemId } = req.params;

    const item = await this.itemService.getItemDetail(itemId as string);

    return res.status(200).json(item);
  };

  public createItem = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const images = files?.['images']?.map((file) => file.path); // Lấy mảng URL ảnh phụ
    const primary_image = files?.['images']?.[0]?.path; // Lấy URL ảnh chính

    const itemData = {
      ...req.body,
      primary_image: primary_image,
      images: images,
    };

    if (!itemData.name || !itemData.start_price || !itemData.step_price) {
      throw new AppError(400, 'Vui lòng nhập đầy đủ tên và giá!');
    }

    const newItem = await this.itemService.createItem(itemData, eventId as string);

    return res.status(201).json({
      message: eventId ? 'Thêm vật phẩm vào sự kiện thành công' : 'Thêm vật phẩm vào kho thành công',
      data: newItem,
    });
  };

  public updateItem = async (req: Request, res: Response) => {
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
  };

  public deleteItem = async (req: Request, res: Response) => {
    const { itemId } = req.params;

    await this.itemService.deleteItem(itemId as string);

    return res.status(200).json({
      message: 'Xóa vật phẩm thành công',
    });
  };
}
