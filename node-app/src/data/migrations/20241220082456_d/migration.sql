-- DropForeignKey
ALTER TABLE `gebruikers` DROP FOREIGN KEY `fk_gebruiker_adres`;

-- AddForeignKey
ALTER TABLE `gebruikers` ADD CONSTRAINT `fk_gebruiker_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
