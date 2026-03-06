/*
  Warnings:

  - Added the required column `approval_id` to the `approval_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepType` to the `approval_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `approval_steps` ADD COLUMN `approval_id` INTEGER NOT NULL,
    ADD COLUMN `approved_category_id` INTEGER NULL,
    ADD COLUMN `stepType` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `attribution_window` INTEGER NULL,
    ADD COLUMN `shelfStatus` VARCHAR(20) NULL,
    ADD COLUMN `submit_time` DATETIME(3) NULL,
    ADD COLUMN `submitter_name` VARCHAR(50) NULL,
    ADD COLUMN `targetCountries` VARCHAR(200) NULL;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_roles_user_id_role_key`(`user_id`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `category_id` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_approval_id_fkey` FOREIGN KEY (`approval_id`) REFERENCES `approvals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
