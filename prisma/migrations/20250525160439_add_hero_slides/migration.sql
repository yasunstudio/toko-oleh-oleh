-- CreateTable
CREATE TABLE `hero_slides` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `backgroundImage` VARCHAR(191) NULL,
    `backgroundColor` VARCHAR(191) NULL,
    `textColor` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    `primaryButtonText` VARCHAR(191) NOT NULL,
    `primaryButtonLink` VARCHAR(191) NOT NULL,
    `secondaryButtonText` VARCHAR(191) NULL,
    `secondaryButtonLink` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
