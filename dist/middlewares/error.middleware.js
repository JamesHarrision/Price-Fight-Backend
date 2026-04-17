"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = require("../utils/appError");
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Lỗi hệ thống nội bộ';
    if (err instanceof appError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else {
        console.error('🔥 [LỖI HỆ THỐNG GHI NHẬN TẠI MIDDLEWARE]:', err);
    }
    res.status(statusCode).json({
        status: 'error',
        message: message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
