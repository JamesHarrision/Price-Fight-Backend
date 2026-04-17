"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
exports.passwordUtil = {
    hash: (plainText) => {
        return bcrypt_1.default.hash(plainText, SALT_ROUNDS);
    },
    compare: (plainText, hashed) => {
        return bcrypt_1.default.compare(plainText, hashed);
    }
};
