-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'VIEWER';

-- AlterTable
ALTER TABLE `AuditLog` MODIFY `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'BULK_UPDATE', 'ACCOUNT') NOT NULL;

-- CreateIndex
CREATE INDEX `Product_status_idx` ON `Product`(`status`);

-- CreateIndex
CREATE INDEX `Product_updatedAt_idx` ON `Product`(`updatedAt`);
