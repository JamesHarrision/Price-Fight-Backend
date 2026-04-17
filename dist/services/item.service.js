"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const event_repository_1 = require("../repositories/event.repository");
const item_repository_1 = require("../repositories/item.repository");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const appError_1 = require("../utils/appError");
class ItemService {
    constructor() {
        this.itemRepo = new item_repository_1.ItemRepository();
        this.eventRepo = new event_repository_1.EventRepository();
        this.getItemsByEvent = async (eventId, page = 1, limit = 5) => {
            const event = await this.eventRepo.findById(eventId);
            if (!event) {
                throw new appError_1.AppError(404, 'Sự kiện không tồn tại!');
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
        this.getItemDetail = async (itemId) => {
            const item = await this.itemRepo.getItemById(itemId);
            if (!item) {
                throw new appError_1.AppError(404, 'Vật phẩm không tồn tại!');
            }
            return item;
        };
        this.createItem = async (data, eventId) => {
            if (eventId) {
                const event = await this.eventRepo.findById(eventId);
                if (!event) {
                    throw new appError_1.AppError(404, 'Sự kiện không tồn tại!');
                }
                if (event.status !== 'PENDING') {
                    throw new appError_1.AppError(400, 'Chỉ có thể thêm vật phẩm khi sự kiện chưa bắt đầu');
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
        this.updateItem = async (itemId, data) => {
            const item = await this.itemRepo.getItemById(itemId);
            if (!item) {
                throw new appError_1.AppError(404, 'Vật phẩm không tồn tại!');
            }
            if (item.status !== 'WAITING' && item.status !== 'UNSOLD') {
                throw new appError_1.AppError(400, 'Không thể sửa vật phẩm đang hoặc đã đấu giá');
            }
            const updateData = {};
            if (data.name)
                updateData.name = data.name;
            if (data.description)
                updateData.description = data.description;
            if (data.event_id !== undefined) {
                // Chỉ item WAITING hoặc UNSOLD mới được gán vào sự kiện
                if (data.event_id && item.status !== 'WAITING' && item.status !== 'UNSOLD') {
                    throw new appError_1.AppError(400, 'Không thể thêm vật phẩm đã bán hoặc đang đấu giá vào sự kiện');
                }
                // Sự kiện đích phải ở trạng thái PENDING
                if (data.event_id) {
                    const targetEvent = await this.eventRepo.findById(data.event_id);
                    if (!targetEvent)
                        throw new appError_1.AppError(404, 'Sự kiện đích không tồn tại');
                    if (targetEvent.status !== 'PENDING') {
                        throw new appError_1.AppError(400, 'Chỉ có thể thêm vật phẩm vào sự kiện chưa bắt đầu');
                    }
                }
                updateData.event_id = data.event_id ? data.event_id : null;
            }
            if (data.primary_image) {
                updateData.primary_image = data.primary_image;
                if (item.primary_image) {
                    await (0, cloudinary_util_1.deleteImageFromCloudinary)(item.primary_image);
                }
            }
            if (data.images) {
                updateData.images = data.images;
                if (item.images && Array.isArray(item.images)) {
                    for (const oldImageUrl of item.images) {
                        await (0, cloudinary_util_1.deleteImageFromCloudinary)(oldImageUrl);
                    }
                }
            }
            if (data.start_price)
                updateData.start_price = Number(data.start_price);
            if (data.step_price)
                updateData.step_price = Number(data.step_price);
            return await this.itemRepo.updateItem(itemId, updateData);
        };
        this.deleteItem = async (itemId) => {
            const item = await this.itemRepo.getItemById(itemId);
            if (!item) {
                throw new appError_1.AppError(404, 'Vật phẩm không tồn tại!');
            }
            if (item.status !== 'WAITING') {
                throw new appError_1.AppError(400, 'Không thể xóa vật phẩm đang hoặc đã đấu giá');
            }
            if (item.primary_image) {
                await (0, cloudinary_util_1.deleteImageFromCloudinary)(item.primary_image);
            }
            if (item.images && Array.isArray(item.images)) {
                for (const imageUrl of item.images) {
                    await (0, cloudinary_util_1.deleteImageFromCloudinary)(imageUrl);
                }
            }
            await this.itemRepo.deleteItem(itemId);
            return true;
        };
        this.getInventoryItems = async (page = 1, limit = 5, search, status, unassignedOnly) => {
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
}
exports.ItemService = ItemService;
