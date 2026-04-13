import { PrismaClient, EventStatus, ItemStatus } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

// Replica chính xác hàm getDate() của backend (UTC+7)
const getDate = () => dayjs().add(7, 'hour');

async function main() {
  // Tham số thời gian demo (phút) - có thể truyền qua command line
  const durationMinutes = parseInt(process.argv[2] || '30', 10);

  const now = getDate();
  const startTime = now.subtract(1, 'minute').toDate(); // Đã bắt đầu 1 phút trước -> Cronjob nhận ngay
  const endTime = now.add(durationMinutes, 'minute').toDate();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🔥 PRICEFIGHT DEMO SEED - FULL LIFECYCLE 🔥        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Thời gian hiện tại:  ${now.format('HH:mm:ss DD/MM/YYYY')}                    ║`);
  console.log(`║  Sự kiện bắt đầu:    ${dayjs(startTime).format('HH:mm:ss')} (đã qua → Cronjob mở ngay)    ║`);
  console.log(`║  Sự kiện kết thúc:    ${dayjs(endTime).format('HH:mm:ss')} (${durationMinutes} phút từ bây giờ)           ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const event = await prisma.auctionEvent.create({
    data: {
      title: '🔥 [LIVE DEMO] Luxury Watch Auction',
      description: 'Phiên đấu giá trực tiếp sử dụng Firebase Realtime Database. Mọi lượt bid được xử lý qua Firebase Transaction chống Race Condition, giá cập nhật realtime cho tất cả người dùng mà không cần polling MySQL.',
      cover_image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80',
      start_time: startTime,
      end_time: endTime,
      status: EventStatus.PENDING,
      items: {
        create: [
          {
            name: 'Rolex Submariner Date 126610LN',
            description: 'Ref 126610LN, 41mm Oystersteel case, Black Cerachrom bezel, Full Box & Papers 2024. Đồng hồ lặn huyền thoại với bộ máy Calibre 3235, chống nước 300m.',
            primary_image: 'https://images.unsplash.com/photo-1614164185128-e4ec8d4bf7fb?auto=format&fit=crop&q=80',
            start_price: 500,
            step_price: 50,
            status: ItemStatus.WAITING,
          },
          {
            name: 'Omega Speedmaster Moonwatch Professional',
            description: 'Ref 310.30.42.50.01.001, Manual-winding Co-Axial chronograph, Hesalite crystal. Đồng hồ đầu tiên bay lên Mặt Trăng - NASA certified.',
            primary_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80',
            start_price: 300,
            step_price: 50,
            status: ItemStatus.WAITING,
          },
          {
            name: 'Cartier Santos de Cartier Medium',
            description: 'WSSA0029, Stainless steel case, Blue gradient dial, QuickSwitch interchangeable bracelet system. Thiết kế lịch sử từ 1904 - chiếc đồng hồ đeo tay đầu tiên trên thế giới.',
            primary_image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80',
            start_price: 400,
            step_price: 50,
            status: ItemStatus.WAITING,
          }
        ]
      }
    },
    include: { items: true }
  });

  console.log(`✅ Sự kiện đã tạo: "${event.title}"`);
  console.log(`   ID: ${event.id}`);
  console.log('');
  event.items.forEach((item, i) => {
    console.log(`   [${i + 1}] ${item.name}`);
    console.log(`       Giá khởi điểm: $${item.start_price} | Bước giá: $${item.step_price}`);
  });

  console.log('');
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│  📋 KỊCH BẢN DEMO:                                          │');
  console.log('│                                                              │');
  console.log('│  1. Đợi 10 giây → Cronjob quét → PENDING → ONGOING          │');
  console.log('│     (Data được đẩy lên Firebase Realtime DB)                 │');
  console.log('│                                                              │');
  console.log('│  2. Mở 2-3 tab trình duyệt → Đăng nhập user khác nhau      │');
  console.log('│     → Vào cùng 1 sự kiện → BID liên tục                     │');
  console.log('│     → Giá NHẢY REALTIME trên tất cả tab!                     │');
  console.log('│                                                              │');
  console.log('│  3. Demo Race Condition:                                     │');
  console.log('│     → 2 người cùng ấn BID đồng thời → Firebase Transaction  │');
  console.log('│     → Chỉ 1 người thắng, người kia bị reject tự động.       │');
  console.log('│                                                              │');
  console.log(`│  4. Sau ${durationMinutes} phút → Cronjob chốt sổ:                           │`);
  console.log('│     → Rút data Firebase → MySQL                             │');
  console.log('│     → Sinh hóa đơn → Xóa Firebase node                      │');
  console.log('│                                                              │');
  console.log('│  5. Vào "My Orders" → "Won Items" → "Pay Invoice"           │');
  console.log('└──────────────────────────────────────────────────────────────┘');
  console.log('');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
