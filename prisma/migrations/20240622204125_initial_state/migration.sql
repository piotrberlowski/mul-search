-- CreateTable
CREATE TABLE "Format" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Format_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "formatId" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "constraints" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Format_name_key" ON "Format"("name");

-- CreateIndex
CREATE UNIQUE INDEX "List_name_key" ON "List"("name");

-- CreateIndex
CREATE UNIQUE INDEX "List_key_key" ON "List"("key");

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "Format"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
