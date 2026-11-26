-- AlterTable
ALTER TABLE `orders` ADD COLUMN `carrier` ENUM('DHL', 'UPS', 'FEDEX', 'MK_POST', 'OTHER') NULL,
    ADD COLUMN `tracking_number` VARCHAR(100) NULL,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `order_status_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL,
    `changed_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_events_order_id_idx`(`order_id`),
    INDEX `order_status_events_changed_by_id_idx`(`changed_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_status_events` ADD CONSTRAINT `order_status_events_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_events` ADD CONSTRAINT `order_status_events_changed_by_id_fkey` FOREIGN KEY (`changed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Give every existing order a starting history, so its timeline is not empty:
-- PENDING when it was placed, plus its current status if it has moved on since.
INSERT INTO `order_status_events` (`order_id`, `status`, `created_at`)
SELECT `id`, 'PENDING', `created_at` FROM `orders`;

INSERT INTO `order_status_events` (`order_id`, `status`, `created_at`)
SELECT `id`, `status`, `updated_at` FROM `orders` WHERE `status` <> 'PENDING';
