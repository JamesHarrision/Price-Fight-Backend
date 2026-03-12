import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'price_fight_items', // Tên thư mục trên Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép các định dạng này
      transformation: [{ width: 500, height: 500, crop: 'limit' }], // Tự động resize cho nhẹ
    };
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;
