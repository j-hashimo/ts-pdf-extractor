/*
  Warnings:

  - You are about to drop the column `images` on the `PdfUpload` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PdfUpload" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "imageData" TEXT NOT NULL,
    "pdfUploadId" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_pdfUploadId_fkey" FOREIGN KEY ("pdfUploadId") REFERENCES "PdfUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
