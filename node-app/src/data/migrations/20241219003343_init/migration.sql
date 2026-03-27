-- CreateTable
CREATE TABLE `adressen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `land` VARCHAR(255) NOT NULL,
    `straat` VARCHAR(255) NOT NULL,
    `nr` TINYINT UNSIGNED NOT NULL,
    `stadsnaam` VARCHAR(255) NOT NULL,
    `postcode` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gebruikers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `btw_nummer` VARCHAR(15) NOT NULL,
    `bedrijfsnaam` VARCHAR(255) NOT NULL,
    `voornaam` VARCHAR(255) NOT NULL,
    `achternaam` VARCHAR(255) NOT NULL,
    `telefoonnummer` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `wachtwoord_hash` VARCHAR(255) NOT NULL,
    `rollen` JSON NOT NULL,
    `adres_id` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idx_btw_nummer_unique`(`btw_nummer`),
    UNIQUE INDEX `idx_place_name_unique`(`bedrijfsnaam`),
    UNIQUE INDEX `idx_email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aankoopfacturen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `factuurnummer` VARCHAR(255) NOT NULL,
    `factuurdatum` DATETIME(0) NOT NULL,
    `vervaldatum` DATETIME(0) NOT NULL,
    `omschrijving` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `leverancier_id` INTEGER UNSIGNED NOT NULL,
    `gebruiker_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verkoopfacturen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `factuurnummer` VARCHAR(255) NOT NULL,
    `factuurdatum` DATETIME(0) NOT NULL,
    `vervaldatum` DATETIME(0) NOT NULL,
    `omschrijving` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `klant_id` INTEGER UNSIGNED NOT NULL,
    `gebruiker_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `klanten` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `btw_nummer` VARCHAR(20) NOT NULL,
    `bedrijfsnaam` VARCHAR(255) NOT NULL,
    `voornaam` VARCHAR(255) NULL,
    `achternaam` VARCHAR(255) NULL,
    `telefoonnummer` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `adres_id` INTEGER UNSIGNED NOT NULL,
    `gebruiker_id` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idx_btw_nummer_unique`(`btw_nummer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leveranciers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `btw_nummer` VARCHAR(15) NOT NULL,
    `bedrijfsnaam` VARCHAR(255) NOT NULL,
    `telefoonnummer` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `adres_id` INTEGER UNSIGNED NOT NULL,
    `gebruiker_id` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idx_btw_nummer_unique`(`btw_nummer`),
    UNIQUE INDEX `idx_place_name_unique`(`bedrijfsnaam`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aankoopcategorieen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `hoofd_categorie` VARCHAR(255) NOT NULL,
    `sub_categorie` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aankopen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `factuur_id` INTEGER UNSIGNED NOT NULL,
    `bedrag` DECIMAL(10, 2) NOT NULL,
    `btw_percentage` DECIMAL(5, 2) NOT NULL,
    `prive_percentage` DECIMAL(5, 2) NOT NULL,
    `aankoop_categorie_id` INTEGER UNSIGNED NOT NULL,
    `aantal_jaren_afschrijven` INTEGER UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `btw_regimes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `omschrijving` VARCHAR(255) NOT NULL,
    `btw_percentage` DECIMAL(5, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verkopen` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `factuur_id` INTEGER UNSIGNED NOT NULL,
    `omschrijving` VARCHAR(255) NOT NULL,
    `bedrag` DECIMAL(10, 2) NOT NULL,
    `btw_percentage_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gebruikers` ADD CONSTRAINT `fk_gebruiker_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aankoopfacturen` ADD CONSTRAINT `fk_leverancier_aankoopfactuur` FOREIGN KEY (`leverancier_id`) REFERENCES `leveranciers`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aankoopfacturen` ADD CONSTRAINT `fk_gebruiker_aankoopfactuur` FOREIGN KEY (`gebruiker_id`) REFERENCES `gebruikers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verkoopfacturen` ADD CONSTRAINT `fk_klant_verkoopfactuur` FOREIGN KEY (`klant_id`) REFERENCES `klanten`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verkoopfacturen` ADD CONSTRAINT `fk_gebruiker_aankoop` FOREIGN KEY (`gebruiker_id`) REFERENCES `gebruikers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `klanten` ADD CONSTRAINT `fk_klant_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `klanten` ADD CONSTRAINT `fk_bedrijk_klant` FOREIGN KEY (`gebruiker_id`) REFERENCES `gebruikers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leveranciers` ADD CONSTRAINT `fk_leverancier_adres` FOREIGN KEY (`adres_id`) REFERENCES `adressen`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leveranciers` ADD CONSTRAINT `fk_gebruiker_leverancier` FOREIGN KEY (`gebruiker_id`) REFERENCES `gebruikers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aankopen` ADD CONSTRAINT `fk_aankoopfactuur_aankoop` FOREIGN KEY (`factuur_id`) REFERENCES `aankoopfacturen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aankopen` ADD CONSTRAINT `fk_aankoop_categorie_aankoop` FOREIGN KEY (`aankoop_categorie_id`) REFERENCES `aankoopcategorieen`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verkopen` ADD CONSTRAINT `fk_verkoopfactuur_verkoop` FOREIGN KEY (`factuur_id`) REFERENCES `verkoopfacturen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verkopen` ADD CONSTRAINT `fk_btw_regime_verkoop` FOREIGN KEY (`btw_percentage_id`) REFERENCES `btw_regimes`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
