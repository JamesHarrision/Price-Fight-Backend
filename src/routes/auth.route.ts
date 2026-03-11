import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
const router = Router();

const authController = new AuthController();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/verify-email', authController.verifyEmail);

router.post('/resend-email', authController.resendEmail);


router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authController.logout);

export default router;

