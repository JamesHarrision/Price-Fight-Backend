import admin from 'firebase-admin'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config();

const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH as string);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`[Firebase] Không tìm thấy tệp Service Account tại: ${serviceAccountPath}`);
} else {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('[Firebase] Admin SDK khởi tạo thành công.');
  } catch (error) {
    console.error('[Firebase] Lỗi khởi tạo:', error);
  }
}

// Xuất đối tượng database để các file khác sử dụng
export const firebaseDB = admin.database();