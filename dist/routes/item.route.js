"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_controller_1 = require("../controllers/item.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cloudinary_config_1 = require("../config/cloudinary.config");
const router = (0, express_1.Router)();
const itemController = new item_controller_1.ItemController();
const uploadItemImages = cloudinary_config_1.cloudinaryUpload.fields([
    { name: 'primary_image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
]);
router.get('/items/inventory', auth_middleware_1.authenticate, auth_middleware_1.authorizedAdmin, itemController.getInventoryItems);
router.get('/events/:eventId/items', itemController.getItemsByEvent);
router.get('/items/:itemId', itemController.getItemDetail);
router.post('/items', auth_middleware_1.authenticate, auth_middleware_1.authorizedAdmin, uploadItemImages, itemController.createItem);
router.post('/events/:eventId/items', auth_middleware_1.authenticate, auth_middleware_1.authorizedAdmin, uploadItemImages, itemController.createItem);
router.put('/items/:itemId', auth_middleware_1.authenticate, auth_middleware_1.authorizedAdmin, uploadItemImages, itemController.updateItem);
router.delete('/items/:itemId', auth_middleware_1.authenticate, auth_middleware_1.authorizedAdmin, itemController.deleteItem);
exports.default = router;
