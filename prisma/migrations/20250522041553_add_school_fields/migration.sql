/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN "email" TEXT;
ALTER TABLE "schools" ADD COLUMN "phone" TEXT;
ALTER TABLE "schools" ADD COLUMN "website" TEXT;

-- Atualiza os emails para serem únicos
UPDATE "schools" SET "email" = 'escola1@exemplo.com' WHERE id = (SELECT id FROM "schools" LIMIT 1 OFFSET 0);
UPDATE "schools" SET "email" = 'escola2@exemplo.com' WHERE id = (SELECT id FROM "schools" LIMIT 1 OFFSET 1);
UPDATE "schools" SET "email" = 'escola3@exemplo.com' WHERE id = (SELECT id FROM "schools" LIMIT 1 OFFSET 2);
UPDATE "schools" SET "email" = 'escola4@exemplo.com' WHERE id = (SELECT id FROM "schools" LIMIT 1 OFFSET 3);
UPDATE "schools" SET "email" = 'escola5@exemplo.com' WHERE id = (SELECT id FROM "schools" LIMIT 1 OFFSET 4);

-- Atualiza os telefones
UPDATE "schools" SET "phone" = '(11) 1234-5678' WHERE "phone" IS NULL;

-- Torna os campos obrigatórios
ALTER TABLE "schools" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "schools" ALTER COLUMN "phone" SET NOT NULL;

-- Adiciona a restrição unique no email
ALTER TABLE "schools" ADD CONSTRAINT "schools_email_key" UNIQUE ("email");
