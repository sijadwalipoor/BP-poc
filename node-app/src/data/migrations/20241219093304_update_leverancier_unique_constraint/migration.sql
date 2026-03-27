/*
  Warnings:

  - A unique constraint covering the columns `[btw_nummer,gebruiker_id]` on the table `klanten` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[btw_nummer,gebruiker_id]` on the table `leveranciers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `idx_btw_nummer_unique` ON `klanten`;

-- DropIndex
DROP INDEX `idx_btw_nummer_unique` ON `leveranciers`;

-- DropIndex
DROP INDEX `idx_place_name_unique` ON `leveranciers`;

-- CreateIndex
CREATE UNIQUE INDEX `idx_btw_nummer_gebruiker_unique` ON `klanten`(`btw_nummer`, `gebruiker_id`);

-- CreateIndex
CREATE UNIQUE INDEX `idx_btw_nummer_gebruiker_leverancier_unique` ON `leveranciers`(`btw_nummer`, `gebruiker_id`);
