/*
  Warnings:

  - You are about to drop the column `achievementAlerts` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `browserNotifications` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `dailyDigestEnabled` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultReminderTime` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `dueDateReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `maxDailyReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `overdueReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `projectReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `reminderFrequency` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `researchReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `systemNotifications` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `todoReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyDigestEnabled` on the `NotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `workoutReminders` on the `NotificationSettings` table. All the data in the column will be lost.
  - Made the column `quietHoursTimezone` on table `NotificationSettings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- First, handle existing NULL values in User table
UPDATE "User" SET "email" = CONCAT('user_', "id", '@example.com') WHERE "email" IS NULL;

-- Update NULL quietHoursTimezone values
UPDATE "NotificationSettings" SET "quietHoursTimezone" = 'UTC' WHERE "quietHoursTimezone" IS NULL;

-- AlterTable
ALTER TABLE "NotificationSettings" DROP COLUMN "achievementAlerts",
DROP COLUMN "browserNotifications",
DROP COLUMN "dailyDigestEnabled",
DROP COLUMN "defaultReminderTime",
DROP COLUMN "dueDateReminders",
DROP COLUMN "emailNotifications",
DROP COLUMN "maxDailyReminders",
DROP COLUMN "overdueReminders",
DROP COLUMN "projectReminders",
DROP COLUMN "pushNotifications",
DROP COLUMN "reminderFrequency",
DROP COLUMN "researchReminders",
DROP COLUMN "systemNotifications",
DROP COLUMN "todoReminders",
DROP COLUMN "weeklyDigestEnabled",
DROP COLUMN "workoutReminders",
ADD COLUMN     "defaultReminderTiming" TEXT NOT NULL DEFAULT '24',
ADD COLUMN     "enableBrowserNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableDailyDigest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enablePushNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableWeeklyDigest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "projectNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "researchNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "todoNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "workoutNotifications" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "quietHoursTimezone" SET NOT NULL,
ALTER COLUMN "quietHoursTimezone" SET DEFAULT 'UTC';

-- AlterTable - Add timestamp columns with defaults for existing rows
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PushSubscription_userId_isActive_idx" ON "PushSubscription"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_endpoint_key" ON "PushSubscription"("userId", "endpoint");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
