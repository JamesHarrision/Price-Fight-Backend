"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bid_controller_1 = require("../controllers/bid.controller");
const router = (0, express_1.Router)();
const bidController = new bid_controller_1.BidController();
router.post('/events/:eventId/items/:itemId/bids', auth_middleware_1.authenticate, bidController.placeBid);
exports.default = router;
