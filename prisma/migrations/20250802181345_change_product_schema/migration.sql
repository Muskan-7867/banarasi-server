/*
  Warnings:

  - You are about to drop the column `sizeId` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SubCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_sizeId_fkey`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `sizeId`;

-- CreateIndex
CREATE UNIQUE INDEX `Category_name_key` ON `Category`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `SubCategory_name_key` ON `SubCategory`(`name`);
