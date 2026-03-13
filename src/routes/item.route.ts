import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { authenticate, authorizedAdmin } from '../middlewares/auth.middleware';
import { cloudinaryUpload } from '../config/cloudinary.config';

const router = Router();
const itemController = new ItemController();

const uploadItemImages = cloudinaryUpload.fields([
  { name: 'primary_image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

router.get('/events/:eventId/items', itemController.getItemsByEvent);

router.get('/items/:itemId', itemController.getItemDetail);

router.post('/events/:eventId/items', authenticate, authorizedAdmin, uploadItemImages, itemController.createItem);

router.put('/items/:itemId', authenticate, authorizedAdmin, uploadItemImages, itemController.updateItem);

router.delete('/items/:itemId', authenticate, authorizedAdmin, itemController.deleteItem);


export default router;
