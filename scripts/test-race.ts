/**
 * 🏁 RACE CONDITION TEST
 * 
 * Điền 4 giá trị bên dưới → chạy: npm run race
 * Script sẽ bắn 2 bid ĐỒNG THỜI vào cùng 1 sản phẩm.
 * Mở UI lên → Chỉ 1 người được cập nhật!
 */
import { BidService } from '../src/services/bid.service';

// ====== ĐIỀN THÔNG TIN TẠI ĐÂY ======
const userIdA = '6293d22b-6b81-4904-b568-2797440738cc';
const userIdB = 'd222f037-f7e4-4876-b9e7-fe7f408d2577';
const eventId = '9799105a-fbac-452b-be19-8ee57c7497d8';
const itemId = '8080d1af-2294-47ff-81d0-b934399bc135';
const bidAmount = 1100; // Cả 2 cùng bid MỘT MỨC GIÁ
// =====================================

const bidService = new BidService();

async function main() {
  console.log('');
  console.log('🏁 Đang bắn 2 bid ĐỒNG THỜI...');
  console.log(`   User A: ${userIdA.substring(0, 8)}...  →  $${bidAmount}`);
  console.log(`   User B: ${userIdB.substring(0, 8)}...  →  $${bidAmount}`);
  console.log('');

  const [resultA, resultB] = await Promise.allSettled([
    bidService.placeBid(eventId, itemId, userIdA, 1550),
    bidService.placeBid(eventId, itemId, userIdB, 1560),
  ]);

  console.log('══════════════ KẾT QUẢ ══════════════');
  console.log('');
  console.log(`  User A: ${resultA.status === 'fulfilled' ? '✅ THÀNH CÔNG → $' + resultA.value.current_price : '❌ BỊ REJECT → ' + resultA.reason?.message}`);
  console.log(`  User B: ${resultB.status === 'fulfilled' ? '✅ THÀNH CÔNG → $' + resultB.value.current_price : '❌ BỊ REJECT → ' + resultB.reason?.message}`);
  console.log('');
  console.log('→ Mở UI lên để xác nhận chỉ có 1 người được cập nhật!');
  console.log('');
}

main().catch(e => console.error('Lỗi:', e.message));
