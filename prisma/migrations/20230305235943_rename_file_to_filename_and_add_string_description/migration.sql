/*
  Warnings:

  - Added the required column `description` to the `Puzzle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Puzzle" ADD COLUMN     "description" STRING NOT NULL;
