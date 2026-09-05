-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `ean` VARCHAR(191) NOT NULL DEFAULT '',
    `manufacturerCode` VARCHAR(191) NOT NULL DEFAULT '',
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL DEFAULT '',
    `categoryId` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'szt.',
    `price` DECIMAL(10, 2) NOT NULL,
    `vat` INTEGER NOT NULL DEFAULT 23,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `minOrder` INTEGER NOT NULL DEFAULT 1,
    `packageQty` INTEGER NOT NULL DEFAULT 1,
    `warehouseLocation` VARCHAR(191) NOT NULL DEFAULT '',
    `weightKg` DECIMAL(8, 3) NOT NULL,
    `voltage` VARCHAR(191) NOT NULL DEFAULT '',
    `current` VARCHAR(191) NOT NULL DEFAULT '',
    `ipRating` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('ACTIVE', 'DRAFT', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `description` TEXT NOT NULL,
    `notes` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAttribute` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `ProductAttribute_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSubstitute` (
    `productId` VARCHAR(191) NOT NULL,
    `substituteId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`productId`, `substituteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAttribute` ADD CONSTRAINT `ProductAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubstitute` ADD CONSTRAINT `ProductSubstitute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubstitute` ADD CONSTRAINT `ProductSubstitute_substituteId_fkey` FOREIGN KEY (`substituteId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
