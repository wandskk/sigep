-- AlterTable
ALTER TABLE "Responsavel" ADD COLUMN "endereco" TEXT;

-- Atualiza registros existentes com um valor padrão
UPDATE "Responsavel" SET "endereco" = 'Não informado' WHERE "endereco" IS NULL;

-- Torna o campo obrigatório após atualizar os registros existentes
ALTER TABLE "Responsavel" ALTER COLUMN "endereco" SET NOT NULL; 