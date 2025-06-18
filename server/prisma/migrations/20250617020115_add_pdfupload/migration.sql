/*
  Warnings:

  - You are about to drop the `PDFUpload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExtractedHighlight" DROP CONSTRAINT "ExtractedHighlight_pdfUploadId_fkey";

-- DropForeignKey
ALTER TABLE "ExtractedImage" DROP CONSTRAINT "ExtractedImage_pdfUploadId_fkey";

-- DropForeignKey
ALTER TABLE "PDFUpload" DROP CONSTRAINT "PDFUpload_userId_fkey";

-- DropTable
DROP TABLE "PDFUpload";

-- CreateTable
CREATE TABLE "PdfUpload" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "highlights" TEXT[],
    "images" TEXT[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfUpload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PdfUpload" ADD CONSTRAINT "PdfUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedHighlight" ADD CONSTRAINT "ExtractedHighlight_pdfUploadId_fkey" FOREIGN KEY ("pdfUploadId") REFERENCES "PdfUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedImage" ADD CONSTRAINT "ExtractedImage_pdfUploadId_fkey" FOREIGN KEY ("pdfUploadId") REFERENCES "PdfUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
