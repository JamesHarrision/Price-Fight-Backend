-- DropForeignKey
ALTER TABLE `auction_items` DROP FOREIGN KEY `auction_items_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `event_participants` DROP FOREIGN KEY `event_participants_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `event_participants` DROP FOREIGN KEY `event_participants_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `auction_items` ADD CONSTRAINT `auction_items_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `auction_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `auction_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_participants` ADD CONSTRAINT `event_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
