-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '#f9fafb',
ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "dashboardBackground" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "gradientType" TEXT NOT NULL DEFAULT 'blue';
