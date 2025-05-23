/*
  Warnings:

  - A unique constraint covering the columns `[alunoTurmaId,disciplinaId,data]` on the table `presencas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `disciplinaId` to the `presencas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "presencas_alunoTurmaId_data_key";

-- AlterTable
ALTER TABLE "presencas" ADD COLUMN     "disciplinaId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "presencas_alunoTurmaId_disciplinaId_data_key" ON "presencas"("alunoTurmaId", "disciplinaId", "data");

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
