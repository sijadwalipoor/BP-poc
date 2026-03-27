-- DropForeignKey
ALTER TABLE `gebruikers` DROP FOREIGN KEY `fk_gebruiker_adres`;

-- DropForeignKey
ALTER TABLE `klanten` DROP FOREIGN KEY `fk_klant_adres`;

-- DropForeignKey
ALTER TABLE `leveranciers` DROP FOREIGN KEY `fk_leverancier_adres`;

-- AddForeignKey
ALTER TABLE `gebruikers` ADD CONSTRAINT `fk_gebruiker_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `klanten` ADD CONSTRAINT `fk_klant_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leveranciers` ADD CONSTRAINT `fk_leverancier_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
