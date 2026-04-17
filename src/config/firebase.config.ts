import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config();

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!raw) {
  throw new Error('[Firebase] Biến môi trường FIREBASE_SERVICE_ACCOUNT_JSON chưa được set!');
}

try {
  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  console.log('[Firebase] Admin SDK khởi tạo thành công.');
} catch (error) {
  console.error('[Firebase] Lỗi khởi tạo:', error);
  throw error;
}

// Xuất đối tượng database để các file khác sử dụng
export const firebaseDB = admin.database();