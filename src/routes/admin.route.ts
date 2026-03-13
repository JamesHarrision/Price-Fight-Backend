import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizedAdmin } from '../middlewares/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.post('/jobs/cleanup-tokens', authenticate, authorizedAdmin, adminController.manualTriggerCleanupTokens);

export default router;
