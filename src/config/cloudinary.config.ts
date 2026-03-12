import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'price_fight_files', // Tên thư mục trên Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép các định dạng này
      transformation: [{ width: 500, height: 500, crop: 'limit' }], // Tự động resize cho nhẹ
    };
  },
});

// 3. Export Multer Middleware
export const cloudinaryUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});


// Lấy file ra từ req.file
