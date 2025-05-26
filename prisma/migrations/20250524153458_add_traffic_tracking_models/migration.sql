-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_category_key_key`(`category`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_visits` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `pageTitle` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration` INTEGER NULL,
    `referrer` VARCHAR(191) NULL,
    `bounced` BOOLEAN NOT NULL DEFAULT false,
    `visitorId` VARCHAR(191) NOT NULL,

    INDEX `page_visits_url_idx`(`url`),
    INDEX `page_visits_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `device` ENUM('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `country` VARCHAR(191) NULL,
    `firstVisit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastVisit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `visitors_sessionId_key`(`sessionId`),
    INDEX `visitors_sessionId_idx`(`sessionId`),
    INDEX `visitors_device_idx`(`device`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_visits` ADD CONSTRAINT `page_visits_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
