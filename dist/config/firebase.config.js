"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseDB = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) {
    throw new Error('[Firebase] Biến môi trường FIREBASE_SERVICE_ACCOUNT_JSON chưa được set!');
}
try {
    const serviceAccount = JSON.parse(raw);
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('[Firebase] Admin SDK khởi tạo thành công.');
}
catch (error) {
    console.error('[Firebase] Lỗi khởi tạo:', error);
    throw error;
}
// Xuất đối tượng database để các file khác sử dụng
exports.firebaseDB = firebase_admin_1.default.database();
