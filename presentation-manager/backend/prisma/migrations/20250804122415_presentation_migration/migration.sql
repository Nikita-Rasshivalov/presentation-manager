-- CreateTable
CREATE TABLE `Presentation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Presentation_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slide` (
    `id` VARCHAR(191) NOT NULL,
    `slideIndex` INTEGER NOT NULL,
    `presentationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Slide_presentationId_slideIndex_idx`(`presentationId`, `slideIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SlideElement` (
    `id` VARCHAR(191) NOT NULL,
    `slideId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `posX` DOUBLE NOT NULL,
    `posY` DOUBLE NOT NULL,
    `width` DOUBLE NOT NULL,
    `height` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SlideElement_slideId_idx`(`slideId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `socketId` VARCHAR(191) NULL,
    `role` ENUM('CREATOR', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `presentationId` VARCHAR(191) NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserSession_presentationId_idx`(`presentationId`),
    INDEX `UserSession_socketId_idx`(`socketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Slide` ADD CONSTRAINT `Slide_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `Presentation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SlideElement` ADD CONSTRAINT `SlideElement_slideId_fkey` FOREIGN KEY (`slideId`) REFERENCES `Slide`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_presentationId_fkey` FOREIGN KEY (`presentationId`) REFERENCES `Presentation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
