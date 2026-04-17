"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const day_util_1 = require("./day.util");
const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';
exports.tokenUtil = {
    generateOTP: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    generateToken: () => {
        return crypto_1.default.randomBytes(32).toString('hex');
    },
    signAccessToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        });
    },
    signRefreshToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        });
    },
    getExpiresAt: (unit, amount) => {
        const date = (0, day_util_1.getDate)();
        if (unit === 'minutes')
            date.setMinutes(date.getMinutes() + amount);
        if (unit === 'hours')
            date.setHours(date.getHours() + amount);
        if (unit === 'days')
            date.setDate(date.getDate() + amount);
        return date;
    },
};
