import { PrismaClient, Role, EventStatus, ItemStatus, TransactionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Xóa theo thứ tự để tránh vướng foreign key constraints
  await prisma.transaction.deleteMany();
  await prisma.bidHistory.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.auctionItem.deleteMany();
  await prisma.auctionEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding new data...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pricefight.com',
      password: hashedPassword,
      full_name: 'Quản trị viên',
      role: Role.ADMIN,
      balance: 10000000,
      is_verified: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'nguoidung1@gmail.com',
      password: hashedPassword,
      full_name: 'Trần Văn A',
      role: Role.USER,
      balance: 5000000,
      is_verified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'nguoidung2@gmail.com',
      password: hashedPassword,
      full_name: 'Lê Thị B',
      role: Role.USER,
      balance: 12000000,
      is_verified: true,
    },
  });

  // 2. Events
  const now = new Date();

  // Sự kiện Đã kết thúc
  const eventEnded = await prisma.auctionEvent.create({
    data: {
      title: 'Phiên Đấu Giá Trang Sức Tháng 3',
      description: 'Tổng hợp các mẫu đồng hồ và trang sức xa xỉ.',
      start_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
      end_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),   // 5 ngày trước
      status: EventStatus.ENDED,
      cover_image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200',
    }
  });

  // Sự kiện Đang diễn ra
  const eventOngoing = await prisma.auctionEvent.create({
    data: {
      title: 'Đấu Giá Siêu Xe Thể Thao',
      description: 'Cơ hội sở hữu những dòng xe giới hạn.',
      start_time: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 giờ trước
      end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 ngày tới
      status: EventStatus.ONGOING,
      cover_image: 'https://images.unsplash.com/photo-1503376712344-c8c36148c4e4?q=80&w=1200',
    }
  });

  // Sự kiện Sắp diễn ra
  const eventPending = await prisma.auctionEvent.create({
    data: {
      title: 'Bộ Sưu Tập NFT Nghệ Thuật Số',
      description: 'Đấu giá các tác phẩm Digital Art hot nhất.',
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 ngày tới
      end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: EventStatus.PENDING,
      cover_image: 'https://images.unsplash.com/photo-1642289659424-644ef4a6aa73?q=80&w=1200',
    }
  });

  // 3. Items
  // Items cho Event Đã kết thúc
  const item1 = await prisma.auctionItem.create({
    data: {
      event_id: eventEnded.id,
      name: 'Đồng hồ Rolex Submariner',
      description: 'Fullbox, giấy tờ bảo hành toàn cầu.',
      primary_image: 'https://rubberb.com/blog/wp-content/uploads/2023/04/Rolex-Submariner-Date-on-Pacific-Blue-Rubber-B-Strap.jpg',
      start_price: 200000,
      step_price: 10000,
      current_price: 450000,
      winner_id: user1.id,
      status: ItemStatus.SOLD,
    }
  });

  const item2 = await prisma.auctionItem.create({
    data: {
      event_id: eventEnded.id,
      name: 'Túi xách Hermes Birkin',
      description: 'Mới 99%, da cá sấu.',
      primary_image: 'https://saigonplaza.com.vn/uploads/images/tui-xach-nu-hermes-van-da-ca-sau-h18321-4.jpg',
      start_price: 300000,
      step_price: 20000,
      current_price: 800000,
      winner_id: user2.id,
      status: ItemStatus.SOLD,
    }
  });

  // Items cho Event Đang diễn ra
  const item3 = await prisma.auctionItem.create({
    data: {
      event_id: eventOngoing.id,
      name: 'Porsche 911 GT3 RS',
      description: 'Bản giới hạn 2023.',
      primary_image: 'https://a.storyblok.com/f/322327/1940x1320/2c42fb4bc5/cz23v20ox0009-911-gt3-rs-front.jpg/m/990x673/smart/filters:format(webp)?dpl=dpl_xHTXh9YJfpx4B4WWP1CjhnufzmU4',
      start_price: 5000000,
      step_price: 500000,
      current_price: 6000000,
      status: ItemStatus.LIVE,
    }
  });

  // Items cho Event Sắp diễn ra
  await prisma.auctionItem.create({
    data: {
      event_id: eventPending.id,
      name: 'Cổ vật thời Nguyễn',
      description: 'Chống chỉ định fake.',
      primary_image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2022/4/15/1034336/1-MT-895069.jpg?w=800&h=420&crop=auto&scale=both',
      start_price: 1000000,
      step_price: 50000,
      status: ItemStatus.WAITING,
    }
  });

  // 4. Bids (Lịch sử đấu giá)
  await prisma.bidHistory.createMany({
    data: [
      { item_id: item1.id, user_id: user2.id, amount: 250000, time: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
      { item_id: item1.id, user_id: user1.id, amount: 450000, time: new Date(now.getTime() - 5.5 * 24 * 60 * 60 * 1000) }, // User1 win

      { item_id: item2.id, user_id: user1.id, amount: 500000, time: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
      { item_id: item2.id, user_id: user2.id, amount: 800000, time: new Date(now.getTime() - 5.5 * 24 * 60 * 60 * 1000) }, // User2 win

      { item_id: item3.id, user_id: user1.id, amount: 5500000, time: new Date(now.getTime() - 30 * 60 * 1000) },
      { item_id: item3.id, user_id: user2.id, amount: 6000000, time: new Date(now.getTime() - 10 * 60 * 1000) }, // User2 leading
    ]
  });

  // 5. Transactions (Lịch sử thanh toán cho Items SOLD)
  await prisma.transaction.create({
    data: {
      item_id: item1.id,
      user_id: user1.id,
      amount: 450000,
      status: TransactionStatus.PAID,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.transaction.create({
    data: {
      item_id: item2.id,
      user_id: user2.id,
      amount: 800000,
      status: TransactionStatus.PENDING,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding completed! ✅');
  console.log(`- Admin: admin@pricefight.com / 123456`);
  console.log(`- User 1: nguoidung1@gmail.com / 123456`);
  console.log(`- User 2: nguoidung2@gmail.com / 123456`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
