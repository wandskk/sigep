/*
  Warnings:

  - You are about to drop the column `responsavelId` on the `alunos` table. All the data in the column will be lost.
  - You are about to drop the `responsaveis` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "Parentesco" ADD VALUE 'TIO';

-- DropForeignKey
ALTER TABLE "alunos" DROP CONSTRAINT "alunos_responsavelId_fkey";

-- AlterTable
ALTER TABLE "alunos" DROP COLUMN "responsavelId";

-- DropTable
DROP TABLE "responsaveis";

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "parentesco" "Parentesco" NOT NULL,
    "alunoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Responsavel_cpf_key" ON "Responsavel"("cpf");

-- CreateIndex
CREATE INDEX "Responsavel_alunoId_idx" ON "Responsavel"("alunoId");

-- AddForeignKey
ALTER TABLE "Responsavel" ADD CONSTRAINT "Responsavel_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
