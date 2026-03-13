import { Router } from "express";
import { authenticate, authorizedAdmin } from "../middlewares/auth.middleware";
import { cloudinaryUpload } from "../config/cloudinary.config";
import { EventController } from "../controllers/event.controller";

const router = Router();

const eventController = new EventController();

router.post('/', authenticate, authorizedAdmin, cloudinaryUpload.single("cover_image"), eventController.createEvent);

router.put('/:eventId', authenticate, authorizedAdmin, cloudinaryUpload.single("cover_image"), eventController.updateEvent);

router.delete('/:eventId', authenticate, authorizedAdmin, eventController.deleteEvent);

router.get('/:eventId', eventController.findEvent);

router.delete("/:eventId/participants/:userId", authenticate, eventController.kickUser)

export default router;