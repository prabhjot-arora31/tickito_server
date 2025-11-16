/*
  Warnings:

  - Added the required column `total` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "total" INTEGER NOT NULL;
