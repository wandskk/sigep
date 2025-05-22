-- CreateEnum
CREATE TYPE "TipoNota" AS ENUM ('PROVA', 'TRABALHO', 'EXERCICIO');

-- CreateEnum
CREATE TYPE "Bimestre" AS ENUM ('PRIMEIRO', 'SEGUNDO', 'TERCEIRO', 'QUARTO');

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL,
    "alunoTurmaId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tipo" "TipoNota" NOT NULL,
    "bimestre" "Bimestre" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notas_alunoTurmaId_disciplinaId_tipo_bimestre_data_key" ON "notas"("alunoTurmaId", "disciplinaId", "tipo", "bimestre", "data");

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_alunoTurmaId_fkey" FOREIGN KEY ("alunoTurmaId") REFERENCES "aluno_turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
