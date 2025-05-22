-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "gestorId" TEXT;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "gestores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
