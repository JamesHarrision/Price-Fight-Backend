import { prisma } from "../config/prisma.config";
import { EventRepository } from "../repositories/event.repository";
import { LifeCycleRepository } from "../repositories/lifecycle.repository";
import { getDate } from "../utils/day.util";
import { FirebaseUtils } from "../utils/firebase.util";
import { EventStatus, ItemStatus } from "@prisma/client";

export class LifeCycleService {

  private eventRepo = new EventRepository();

  private lifecycleRepo = new LifeCycleRepository();

  public startPendingEvent = async () => {
    try {
      console.log('🔄 [Lifecycle] Đang kiểm tra các sự kiện cần mở...');

      const pendingEvents = await this.eventRepo.getPendingEvents();

      if (pendingEvents.length === 0) {
        console.log("Không tìm thấy sự kiện thỏa mãn");
        return;
      }

      console.log(`[Lifecycle] Tìm thấy ${pendingEvents.length} sự kiện tới giờ bắt đầu.`);

      // Xử lý từng sự kiện một
      for (const event of pendingEvents) {
        try {
          //. Chuẩn bị Payload cho Firebase
          const firebasePayload: any = { ...event, items: {} }

          for (const item of event.items) {
            firebasePayload.items[item.id] = {
              current_price: Number(item.start_price),
              highest_bidder_id: null,
              bids: {},
            }
          }

          //. Đẩy dữ liệu lên Firebase
          const firebasePath = `events/${event.id}`;
          console.log(firebasePath, firebasePayload);
          await FirebaseUtils.setData(firebasePath, firebasePayload);
          console.log(`[Firebase] Đã khởi tạo node cho sự kiện ${event.id}`);

          //. Cập nhật trạng thái MySQL (Dùng Transaction để đảm bảo an toàn)
          await this.lifecycleRepo.startEvent(event.id);
          console.log(`✅ [Lifecycle] Đã mở cửa thành công sự kiện: ${event.title}`);

        } catch (error: any) {
          console.error(`❌ [Lifecycle] Lỗi khi mở sự kiện ${event.id}:`, error);
        }
      }
    } catch (error: any) {
      console.error('❌ [Lifecycle] Lỗi hệ thống khi chạy startPendingEvents:', error);
    }
  }

}