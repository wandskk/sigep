-- AlterTable
ALTER TABLE "professores" ADD COLUMN     "escolaId" TEXT;

-- AddForeignKey
ALTER TABLE "professores" ADD CONSTRAINT "professores_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
