/*
  Warnings:

  - You are about to drop the column `cargaHoraria` on the `disciplinas` table. All the data in the column will be lost.
  - Added the required column `escolaId` to the `disciplinas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disciplinas" DROP COLUMN "cargaHoraria",
ADD COLUMN     "escolaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "disciplinas" ADD CONSTRAINT "disciplinas_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
