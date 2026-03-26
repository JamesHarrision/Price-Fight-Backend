import { EventRepository } from '../repositories/event.repository';
import { ItemRepository } from '../repositories/item.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';
import { AppError } from '../utils/appError';

export class ItemService {
  private itemRepo = new ItemRepository();
  private eventRepo = new EventRepository();

  public getItemsByEvent = async (eventId: string, page: number = 1, limit: number = 5) => {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new AppError(404, 'Sự kiện không tồn tại!');
    }

    const skip = (page - 1) * limit;

    const { items, total } = await this.itemRepo.getItemsByEventId(eventId, skip, limit);
    return {
      items: items,
      pagination: {
        total_items: total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        limit: limit,
      },
    };
  };

  public getItemDetail = async (itemId: string) => {
    const item = await this.itemRepo.getItemById(itemId);

    if (!item) {
      throw new AppError(404, 'Vật phẩm không tồn tại!');
    }
    return item;
  };

  public createItem = async (data: any, eventId?: string) => {
    if (eventId) {
      const event = await this.eventRepo.findById(eventId);
      if (!event) {
        throw new AppError(404, 'Sự kiện không tồn tại!');
      }
      if (event.status !== 'PENDING') {
        throw new AppError(400, 'Chỉ có thể thêm vật phẩm khi sự kiện chưa bắt đầu');
      }
    }
    const newItemData = {
      event_id: eventId || null,
      name: data.name,
      description: data.description || null,
      primary_image: data.primary_image || null,
      images: data.images || null,
      start_price: Number(data.start_price),
      step_price: Number(data.step_price),
      status: 'WAITING',
    };

    return await this.itemRepo.createItem(newItemData);
  };

  public updateItem = async (itemId: string, data: any) => {
    const item = await this.itemRepo.getItemById(itemId);

    if (!item) {
      throw new AppError(404, 'Vật phẩm không tồn tại!');
    }

    if (item.status !== 'WAITING' && item.status !== 'UNSOLD') {
      throw new AppError(400, 'Không thể sửa vật phẩm đang hoặc đã đấu giá');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.event_id !== undefined) {
      updateData.event_id = data.event_id ? data.event_id : null;
    }
    if (data.primary_image) {
      updateData.primary_image = data.primary_image;
      if (item.primary_image) {
        await deleteImageFromCloudinary(item.primary_image);
      }
    }
    if (data.images) {
      updateData.images = data.images;
      if (item.images && Array.isArray(item.images)) {
        for (const oldImageUrl of item.images) {
          await deleteImageFromCloudinary(oldImageUrl as string);
        }
      }
    }

    if (data.start_price) updateData.start_price = Number(data.start_price);
    if (data.step_price) updateData.step_price = Number(data.step_price);

    return await this.itemRepo.updateItem(itemId, updateData);
  };

  public deleteItem = async (itemId: string) => {
    const item = await this.itemRepo.getItemById(itemId);

    if (!item) {
      throw new AppError(404, 'Vật phẩm không tồn tại!');
    }

    if (item.status !== 'WAITING') {
      throw new AppError(400, 'Không thể xóa vật phẩm đang hoặc đã đấu giá');
    }

    if (item.primary_image) {
      await deleteImageFromCloudinary(item.primary_image);
    }

    if (item.images && Array.isArray(item.images)) {
      for (const imageUrl of item.images) {
        await deleteImageFromCloudinary(imageUrl as string);
      }
    }
    await this.itemRepo.deleteItem(itemId);

    return true;
  };

  public getInventoryItems = async (page: number = 1, limit: number = 5, search?: string, status?: string, unassignedOnly?: boolean) => {
    const skip = (page - 1) * limit;
    const { items, total } = await this.itemRepo.getInventoryItems(skip, limit, search, status, unassignedOnly);

    return {
      items,
      total,
      pagination: {
        total_items: total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        limit: limit,
      },
    };
  };
}
