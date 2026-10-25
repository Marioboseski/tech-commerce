-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_category_id_idx`(`category_id`),
    INDEX `products_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laptop_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `screen_size` VARCHAR(50) NOT NULL,
    `ram` VARCHAR(50) NOT NULL,
    `processor` VARCHAR(255) NOT NULL,
    `storage` VARCHAR(100) NOT NULL,
    `graphics_card` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `laptop_details_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_phone_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `screen_size` VARCHAR(50) NOT NULL,
    `ram` VARCHAR(50) NOT NULL,
    `storage` VARCHAR(100) NOT NULL,
    `processor` VARCHAR(255) NOT NULL,
    `battery` VARCHAR(100) NOT NULL,
    `camera` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `mobile_phone_details_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `computer_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `processor` VARCHAR(255) NOT NULL,
    `ram` VARCHAR(50) NOT NULL,
    `storage` VARCHAR(100) NOT NULL,
    `graphics_card` VARCHAR(255) NOT NULL,
    `form_factor` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `computer_details_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `console_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `manufacturer` VARCHAR(100) NOT NULL,
    `storage` VARCHAR(100) NOT NULL,
    `resolution` VARCHAR(100) NOT NULL,
    `max_players` VARCHAR(100) NOT NULL,
    `connectivity` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `console_details_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tablet_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `screen_size` VARCHAR(50) NOT NULL,
    `ram` VARCHAR(50) NOT NULL,
    `storage` VARCHAR(100) NOT NULL,
    `processor` VARCHAR(255) NOT NULL,
    `battery` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `tablet_details_product_id_key`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laptop_details` ADD CONSTRAINT `laptop_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mobile_phone_details` ADD CONSTRAINT `mobile_phone_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `computer_details` ADD CONSTRAINT `computer_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `console_details` ADD CONSTRAINT `console_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tablet_details` ADD CONSTRAINT `tablet_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
