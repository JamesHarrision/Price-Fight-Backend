import { Router } from "express";
import { authenticate, authorizedAdmin } from "../middlewares/auth.middleware";
import { cloudinaryUpload } from "../config/cloudinary.config";
import { EventController } from "../controllers/event.controller";

const router = Router();

const eventController = new EventController();

router.post('/', authenticate, authorizedAdmin, cloudinaryUpload.single("cover_image"), eventController.createEvent);

router.post('/', authenticate, authorizedAdmin, cloudinaryUpload.single("cover_image"), eventController.createEvent);

export default router;