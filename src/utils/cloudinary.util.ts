import { v2 as cloudinary } from 'cloudinary';

export const deleteImageFromCloudinary = async (imageUrl: string) => {
  try {
    // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/price_fight_items/abc123xyz.jpg
    if (!imageUrl) return;
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1]; // abc123xyz.jpg
    const folderName = urlParts[urlParts.length - 2]; // price_fight_items

    const fileName = filenameWithExtension.split('.')[0]; // abc123xyz

    const publicId = `${folderName}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
    console.log(`Đã xóa ảnh trên Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Lỗi khi xóa ảnh trên Cloudinary:', error);
  }
};
