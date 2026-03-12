import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { uploadCloud } from '../config/cloudinary.config';

const router = Router();
const itemController = new ItemController();

const uploadItemImages = uploadCloud.fields([
  { name: 'primary_image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

router.get('/events/:eventId/items', itemController.getItemsByEvent);

router.get('/items/:id', itemController.getItemDetail);

router.post('/events/:eventId/items', authenticate, authorizeAdmin, uploadItemImages, itemController.createItem);

router.put('/items/:id', authenticate, authorizeAdmin, uploadItemImages, itemController.updateItem);

router.delete('/items/:id', authenticate, authorizeAdmin, itemController.deleteItem);

export default router;
