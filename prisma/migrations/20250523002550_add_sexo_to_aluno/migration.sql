/*
  Warnings:

  - You are about to drop the column `responsavel` on the `alunos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `alunos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nis]` on the table `alunos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cep` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataMatricula` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomeMae` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexo` to the `alunos` table without a default value. This is not possible if the table is not empty.
  - Made the column `endereco` on table `alunos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F', 'OUTRO');

-- CreateEnum
CREATE TYPE "Situacao" AS ENUM ('ATIVO', 'TRANSFERIDO', 'EVADIDO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('MAE', 'PAI', 'AVO', 'OUTRO');

-- AlterTable
ALTER TABLE "alunos" DROP COLUMN "responsavel",
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "dataMatricula" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "nis" TEXT,
ADD COLUMN     "nomeMae" TEXT,
ADD COLUMN     "nomePai" TEXT,
ADD COLUMN     "responsavelId" TEXT,
ADD COLUMN     "sexo" "Sexo",
ADD COLUMN     "situacao" "Situacao" NOT NULL DEFAULT 'ATIVO',
ALTER COLUMN "endereco" DROP NOT NULL;

-- Update existing records with default values
UPDATE "alunos" SET
    "cep" = '00000000',
    "cidade" = 'Não informado',
    "dataMatricula" = CURRENT_TIMESTAMP,
    "estado" = 'Não informado',
    "nomeMae" = 'Não informado',
    "sexo" = 'OUTRO',
    "endereco" = COALESCE("endereco", 'Não informado');

-- Make columns required after updating existing records
ALTER TABLE "alunos" 
    ALTER COLUMN "cep" SET NOT NULL,
    ALTER COLUMN "cidade" SET NOT NULL,
    ALTER COLUMN "dataMatricula" SET NOT NULL,
    ALTER COLUMN "estado" SET NOT NULL,
    ALTER COLUMN "nomeMae" SET NOT NULL,
    ALTER COLUMN "sexo" SET NOT NULL,
    ALTER COLUMN "endereco" SET NOT NULL;

-- CreateTable
CREATE TABLE "responsaveis" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "parentesco" "Parentesco" NOT NULL,
    "endereco" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_cpf_key" ON "responsaveis"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_cpf_key" ON "alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_nis_key" ON "alunos"("nis");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
