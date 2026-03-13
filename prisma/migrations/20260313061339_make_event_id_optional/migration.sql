-- DropForeignKey
ALTER TABLE `auction_items` DROP FOREIGN KEY `auction_items_event_id_fkey`;

-- AlterTable
ALTER TABLE `auction_items` MODIFY `event_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `auction_items` ADD CONSTRAINT `auction_items_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `auction_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
