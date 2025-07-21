/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundImage` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `dashboardBackground` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `gradientType` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "backgroundColor",
DROP COLUMN "backgroundImage",
DROP COLUMN "dashboardBackground",
DROP COLUMN "gradientType";
