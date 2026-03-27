/*
  Warnings:

  - A unique constraint covering the columns `[klant_id,factuurnummer]` on the table `verkoopfacturen` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `verkoopfacturen_klant_id_factuurnummer_key` ON `verkoopfacturen`(`klant_id`, `factuurnummer`);
