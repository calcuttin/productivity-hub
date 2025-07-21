-- CreateTable
CREATE TABLE "ResearchPaper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publication" TEXT,
    "year" INTEGER,
    "abstract" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "filePath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "orcid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchPaperId" TEXT NOT NULL,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PaperAuthors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaperAuthors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_orcid_key" ON "Author"("orcid");

-- CreateIndex
CREATE UNIQUE INDEX "Citation_researchPaperId_key_key" ON "Citation"("researchPaperId", "key");

-- CreateIndex
CREATE INDEX "_PaperAuthors_B_index" ON "_PaperAuthors"("B");

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_researchPaperId_fkey" FOREIGN KEY ("researchPaperId") REFERENCES "ResearchPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaperAuthors" ADD CONSTRAINT "_PaperAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaperAuthors" ADD CONSTRAINT "_PaperAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "ResearchPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
