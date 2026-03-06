-- AlterTable
ALTER TABLE `categories` ADD COLUMN `creator` VARCHAR(50) NULL,
    ADD COLUMN `editor` VARCHAR(50) NULL,
    ADD COLUMN `remark` VARCHAR(200) NULL;
