import * as admin from 'firebase-admin'
import { firebaseDB } from '../config/firebase.config'

// Hàm được viết lại cho dễ dùng từ:
// https://firebase.google.com/docs/database/web/read-and-write

export const FirebaseUtils = {
  /**
   * ĐỌC DỮ LIỆU (GET)
   * Lấy dữ liệu 1 lần duy nhất từ một đường dẫn.
   */
  async getData<T>(path: string): Promise<T | null> {
    try {
      const snapshot = await firebaseDB.ref(path).once('value');
      return snapshot.exists() ? snapshot.val() as T : null;
    } catch (error) {
      console.error(`[Firebase] Lỗi khi đọc data tại ${path}:`, error);
      throw error;
    }
  },

  /**
   * THÊM DỮ LIỆU - TẠO ID TỰ ĐỘNG (PUSH)
   * Thường dùng để thêm phần tử vào list (VD: thêm 1 lượt bid mới vào danh sách bids).
   * Firebase sẽ tự sinh ra một ID unique.
   */
  async pushData(path: string, data: any): Promise<string | null> {
    try {
      const ref = firebaseDB.ref(path);
      const newElementRef = await ref.push(data);
      return newElementRef.key; // Trả về ID vừa được generate
    } catch (error) {
      console.error(`[Firebase] Lỗi khi push data vào ${path}:`, error);
      throw error;
    }
  },

  /**
   * THÊM/GHI ĐÈ DỮ LIỆU - ID CHỈ ĐỊNH (SET)
   * Ghi đè toàn bộ dữ liệu tại đường dẫn. Xóa sạch dữ liệu cũ ở node đó.
   */
  async setData(path: string, data: any): Promise<void> {
    try {
      await firebaseDB.ref(path).set(data);
    } catch (error) {
      console.error(`[Firebase] Lỗi khi set data tại ${path}:`, error);
      throw error;
    }
  },

  /**
   * CẬP NHẬT DỮ LIỆU (UPDATE)
   * Chỉ cập nhật các field được truyền vào, giữ nguyên các field khác.
   */
  async updateData(path: string, data: any): Promise<void> {
    try {
      await firebaseDB.ref(path).update(data);
    } catch (error) {
      console.error(`[Firebase] Lỗi khi update data tại ${path}:`, error);
      throw error;
    }
  },

  /**
   * XÓA DỮ LIỆU (REMOVE)
   * Xóa hoàn toàn node tại đường dẫn được chỉ định.
   */
  async deleteData(path: string): Promise<void> {
    try {
      await firebaseDB.ref(path).remove();
    } catch (error) {
      console.error(`[Firebase] Lỗi khi xóa data tại ${path}:`, error);
      throw error;
    }
  }
};