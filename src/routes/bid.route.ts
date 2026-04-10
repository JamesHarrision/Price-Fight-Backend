import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { BidController } from '../controllers/bid.controller';

const router = Router();
const bidController = new BidController();

router.post('/events/:eventId/items/:itemId/bids', authenticate, bidController.placeBid);

export default router;
