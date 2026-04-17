"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizedAdmin = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Auth] Missing or malformed authorization header:', authHeader);
        return res.status(401).json({ message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log('[Auth] Token verification failed:', error.message);
        return res.status(401).json({ message: 'Access Token đã hết hạn hoặc không hợp lệ.' });
    }
};
exports.authenticate = authenticate;
const authorizedAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'Vui lòng đăng nhập!',
            });
        }
        if (req.user.role !== client_1.Role.ADMIN) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này! Chỉ admin mới có quyền này" });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Lỗi nội bộ của server" });
    }
};
exports.authorizedAdmin = authorizedAdmin;
