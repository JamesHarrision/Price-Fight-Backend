"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const item_service_1 = require("../services/item.service");
const appError_1 = require("../utils/appError");
class ItemController {
    constructor() {
        this.itemService = new item_service_1.ItemService();
        this.getItemsByEvent = async (req, res) => {
            const { eventId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const items = await this.itemService.getItemsByEvent(eventId, page, limit);
            return res.status(200).json(items);
        };
        this.getInventoryItems = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const result = await this.itemService.getInventoryItems(page, limit);
            return res.status(200).json(result);
        };
        this.getItemDetail = async (req, res) => {
            const { itemId } = req.params;
            const item = await this.itemService.getItemDetail(itemId);
            return res.status(200).json(item);
        };
        this.createItem = async (req, res) => {
            const { eventId } = req.params;
            const files = req.files;
            const images = files?.['images']?.map((file) => file.path); // Lấy mảng URL ảnh phụ
            const primary_image = files?.['images']?.[0]?.path; // Lấy URL ảnh chính
            const itemData = {
                ...req.body,
                primary_image: primary_image,
                images: images,
            };
            if (!itemData.name || !itemData.start_price || !itemData.step_price) {
                throw new appError_1.AppError(400, 'Vui lòng nhập đầy đủ tên và giá!');
            }
            const newItem = await this.itemService.createItem(itemData, eventId);
            return res.status(201).json({
                message: eventId ? 'Thêm vật phẩm vào sự kiện thành công' : 'Thêm vật phẩm vào kho thành công',
                data: newItem,
            });
        };
        this.updateItem = async (req, res) => {
            const { itemId } = req.params;
            const files = req.files;
            const primary_image = files?.['primary_image']?.[0]?.path;
            const images = files?.['images']?.map((file) => file.path);
            const updateData = { ...req.body };
            if (primary_image) {
                updateData.primary_image = primary_image;
            }
            if (images) {
                updateData.images = images;
            }
            const updatedItem = await this.itemService.updateItem(itemId, updateData);
            return res.status(200).json({
                message: 'Cập nhật thành công',
                data: updatedItem,
            });
        };
        this.deleteItem = async (req, res) => {
            const { itemId } = req.params;
            await this.itemService.deleteItem(itemId);
            return res.status(200).json({
                message: 'Xóa vật phẩm thành công',
            });
        };
    }
}
exports.ItemController = ItemController;
