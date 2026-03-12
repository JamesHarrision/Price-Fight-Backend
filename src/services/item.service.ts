import { EventRepository } from '../repositories/event.repository';
import { ItemRepository } from '../repositories/item.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary.util';

export class ItemService {
  private itemRepo = new ItemRepository();
  private eventRepo = new EventRepository();

  public getItemsByEvent = async (eventId: string, page: number = 1, limit: number = 5) => {
    const event = await this.eventRepo.getEventById(eventId);
    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    const skip = (page - 1) * limit;

    const { items, total } = await this.itemRepo.getItemsByEventId(eventId, skip, limit);
    return {
      data: items,
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
      throw new Error('ITEM_NOT_FOUND');
    }
    return item;
  };

  public createItem = async (eventId: string, data: any) => {
    const event = await this.eventRepo.getEventById(eventId);
    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }
    if (event.status !== 'PENDING') {
      throw new Error('EVENT_NOT_PENDING');
    }

    const newItemData = {
      event_id: eventId,
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
      throw new Error('ITEM_NOT_FOUND');
    }

    if (item.status !== 'WAITING') {
      throw new Error('ITEM_NOT_WAITING');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.primary_image) updateData.primary_image = data.primary_image;
    if (data.images) updateData.images = data.images;
    if (data.start_price) updateData.start_price = Number(data.start_price);
    if (data.step_price) updateData.step_price = Number(data.step_price);

    return await this.itemRepo.updateItem(itemId, updateData);
  };

  public deleteItem = async (itemId: string) => {
    const item = await this.itemRepo.getItemById(itemId);

    if (!item) {
      throw new Error('ITEM_NOT_FOUND');
    }

    if (item.status !== 'WAITING') {
      throw new Error('ITEM_NOT_WAITING');
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
}
