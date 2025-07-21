-- CreateTable
CREATE TABLE "TimeSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activityType" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectId" TEXT,
    "todoId" TEXT,
    "researchId" TEXT,
    "workoutId" TEXT,
    "productivity" TEXT,
    "focus" TEXT,
    "energy" TEXT,
    "mood" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "TimeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetHours" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "TimeGoal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "ResearchPaper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeGoal" ADD CONSTRAINT "TimeGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
