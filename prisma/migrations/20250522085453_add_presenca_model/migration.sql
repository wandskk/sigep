-- CreateTable
CREATE TABLE "presencas" (
    "id" TEXT NOT NULL,
    "alunoTurmaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "presencas_alunoTurmaId_data_key" ON "presencas"("alunoTurmaId", "data");

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_alunoTurmaId_fkey" FOREIGN KEY ("alunoTurmaId") REFERENCES "aluno_turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
