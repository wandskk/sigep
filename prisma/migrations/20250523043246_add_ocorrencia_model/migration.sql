-- CreateEnum
CREATE TYPE "TipoOcorrencia" AS ENUM ('ADVERTENCIA', 'ELOGIO', 'COMUNICADO', 'OUTRO');

-- CreateTable
CREATE TABLE "Ocorrencia" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "tipo" "TipoOcorrencia" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataOcorrencia" TIMESTAMP(3) NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visivelParaResponsavel" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ocorrencia_alunoId_idx" ON "Ocorrencia"("alunoId");

-- CreateIndex
CREATE INDEX "Ocorrencia_escolaId_idx" ON "Ocorrencia"("escolaId");

-- CreateIndex
CREATE INDEX "Ocorrencia_autorId_idx" ON "Ocorrencia"("autorId");

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
