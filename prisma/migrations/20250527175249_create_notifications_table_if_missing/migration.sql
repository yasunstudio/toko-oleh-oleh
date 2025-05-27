-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('ORDER_STATUS', 'PAYMENT_STATUS', 'GENERAL') NOT NULL,
    `status` ENUM('UNREAD', 'READ') NOT NULL DEFAULT 'UNREAD',
    `orderId` VARCHAR(191) NULL,
    `data` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints if they don't exist
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'notifications' 
                  AND CONSTRAINT_NAME = 'notifications_userId_fkey');

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    'SELECT "Foreign key notifications_userId_fkey already exists";');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists2 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'notifications' 
                   AND CONSTRAINT_NAME = 'notifications_orderId_fkey');

SET @sql2 = IF(@fk_exists2 = 0, 
    'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;',
    'SELECT "Foreign key notifications_orderId_fkey already exists";');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;