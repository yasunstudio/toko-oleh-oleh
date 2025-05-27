-- CreateTable
CREATE TABLE `hero_slides` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `backgroundImage` VARCHAR(191) NULL,
    `backgroundColor` VARCHAR(191) NULL,
    `textColor` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    `primaryButtonText` VARCHAR(191) NULL,
    `primaryButtonLink` VARCHAR(191) NULL,
    `secondaryButtonText` VARCHAR(191) NULL,
    `secondaryButtonLink` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `device` ENUM('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN') NOT NULL DEFAULT 'DESKTOP',
    `firstVisit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastVisit` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visitors_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_visits` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `pageTitle` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referrer` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `bounced` BOOLEAN NOT NULL DEFAULT false,
    `visitorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_visits_timestamp_idx`(`timestamp`),
    INDEX `page_visits_url_idx`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_visits` ADD CONSTRAINT `page_visits_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
