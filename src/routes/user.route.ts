import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { cloudinaryUpload } from "../config/cloudinary.config";

const router = Router();
const userController = new UserController();

router.get('/me', authenticate, userController.getMe);

router.put('/me', authenticate, cloudinaryUpload.single("avatar_url"), userController.updateMe);

router.post('/wallet/deposit', authenticate, userController.deposit);

export default router;