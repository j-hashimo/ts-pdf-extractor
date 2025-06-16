-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PDFUpload" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PDFUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedHighlight" (
    "id" SERIAL NOT NULL,
    "pdfUploadId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ExtractedHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedImage" (
    "id" SERIAL NOT NULL,
    "pdfUploadId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ExtractedImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PDFUpload" ADD CONSTRAINT "PDFUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedHighlight" ADD CONSTRAINT "ExtractedHighlight_pdfUploadId_fkey" FOREIGN KEY ("pdfUploadId") REFERENCES "PDFUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedImage" ADD CONSTRAINT "ExtractedImage_pdfUploadId_fkey" FOREIGN KEY ("pdfUploadId") REFERENCES "PDFUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
