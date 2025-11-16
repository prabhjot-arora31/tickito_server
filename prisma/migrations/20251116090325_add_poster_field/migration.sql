/*
  Warnings:

  - You are about to drop the column `mainImage` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "mainImage",
ADD COLUMN     "poster" TEXT;
