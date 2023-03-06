/*
  Warnings:

  - You are about to drop the column `bottomRightX` on the `Hitbox` table. All the data in the column will be lost.
  - You are about to drop the column `bottomRightY` on the `Hitbox` table. All the data in the column will be lost.
  - You are about to drop the column `topLeftX` on the `Hitbox` table. All the data in the column will be lost.
  - You are about to drop the column `topLeftY` on the `Hitbox` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scheduledFor]` on the table `Puzzle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Hitbox" DROP COLUMN "bottomRightX";
ALTER TABLE "Hitbox" DROP COLUMN "bottomRightY";
ALTER TABLE "Hitbox" DROP COLUMN "topLeftX";
ALTER TABLE "Hitbox" DROP COLUMN "topLeftY";
ALTER TABLE "Hitbox" ADD COLUMN     "bottomRight" INT4[];
ALTER TABLE "Hitbox" ADD COLUMN     "topLeft" INT4[];

-- CreateIndex
CREATE UNIQUE INDEX "Puzzle_scheduledFor_key" ON "Puzzle"("scheduledFor");
