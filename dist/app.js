"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const prisma_config_1 = require("./config/prisma.config");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const item_route_1 = __importDefault(require("./routes/item.route"));
const event_route_1 = __importDefault(require("./routes/event.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const bid_route_1 = __importDefault(require("./routes/bid.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Routes
app.use('/api/auth', auth_route_1.default);
app.use('/api', item_route_1.default);
app.use('/api/events', event_route_1.default);
app.use('/api/users', user_route_1.default);
app.use('/api/admin', admin_route_1.default);
app.use('/api', bid_route_1.default);
app.use('/api', transaction_route_1.default);
app.use(error_middleware_1.globalErrorHandler);
// Test Route
app.get('/', async (req, res) => {
    try {
        const userCount = await prisma_config_1.prisma.user.count();
        res.status(200).json({
            message: 'Welcome to Price-Fight',
            database: 'Connected to MySQL',
            userCount: userCount,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error,
        });
    }
});
exports.default = app;
