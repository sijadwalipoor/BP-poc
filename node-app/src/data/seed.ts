// src/data/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Role from '../core/roles';
import { hashPassword } from '../core/password';

const prisma = new PrismaClient();

async function seedAdressen(aantal : number) {
  const addresses = [];
  
  for (let i = 0; i < aantal; i++) {
    addresses.push({
      land: String(faker.location.country()),
      straat: String(faker.location.street()),
      nr: Number(faker.number.int({min: 1, max: 100})),
      stadsnaam: String(faker.location.city()),
      postcode: String(faker.location.zipCode()),
    });
  }

  return addresses;
}

async function seedGebruikers(aantal : number) {
  const gebruikers = [];
  const createdAddresses = await prisma.adres.findMany();

  for (let i = 0; i < aantal; i++) {
    const random_adres = createdAddresses[faker.number.int({ min: 0, max: createdAddresses.length - 1 })];
    
    const plainPassword = i === 0 ? 'azerty12345' : faker.internet.password();
    const hashedPassword = await hashPassword(plainPassword); // Await the hash result

    gebruikers.push({
      btw_nummer: String('BE' + faker.number.int({ min: 100000000, max: 999999999 })),
      bedrijfsnaam: String(faker.company.name()),
      voornaam: String(faker.person.firstName()),
      achternaam: String(faker.person.lastName()),
      telefoonnummer: String(faker.phone.number()),
      email: i === 0 ? 'example@outlook.com' : String(faker.internet.email()),
      wachtwoord_hash: hashedPassword,
      rollen: JSON.stringify(i === 0 ? [Role.ADMIN] : [Role.USER]), // eerste user/bedrijf is admin!
      adres_id: Number(random_adres?.id),
    });
  }
  return gebruikers;
}

async function seedklanten(aantal : number) {
  const klanten = [];
  const createdAddresses = await prisma.adres.findMany();
  const createdBedrijven = await prisma.gebruiker.findMany();

  for (let i = 0; i < aantal; i++) {
    const random_adres = createdAddresses[faker.number.int({ min: 0, max: createdAddresses.length - 1 })];
    const random_gebruiker = createdBedrijven[faker.number.int({ min: 0, max: createdBedrijven.length - 1 })];
    klanten.push({
      btw_nummer : String('BE' + faker.number.int({ min: 100000000, max: 999999999 })),
      bedrijfsnaam : String(faker.company.name()),
      voornaam : String(faker.person.firstName()),
      achternaam : String(faker.person.lastName()),
      telefoonnummer : String(faker.phone.number()),
      email : String(faker.internet.email()),
      adres_id : Number(random_adres?.id),
      gebruiker_id : Number(random_gebruiker?.id),
    });
  }
  return klanten;
}

async function seedVerkoopfacturen(aantal : number) {
  const verkopenfacturen = [];
  const createdGebruikers = await prisma.gebruiker.findMany();

  for (const gebruiker of createdGebruikers) {
    const createdKlanten = await prisma.klant.findMany({
      where: {
        gebruiker_id: gebruiker.id,
      },
    });

    // Als dit bedrijf/gebruiker geen klanten heeft, ga dan naar de volgende bedrijf
    if (createdKlanten.length === 0) continue;

    // Maak een 'aantal' verkoopfacturen voor dit bedrijf/gebruiker
    for (let i = 0; i < aantal; i++) {
      const random_klant = createdKlanten[
        faker.number.int({ min: 0, max: createdKlanten.length - 1 })
      ];

      if(random_klant === undefined) continue;

      verkopenfacturen.push({
        factuurnummer: String(faker.string.uuid()),
        factuurdatum: faker.date.anytime(),
        vervaldatum: faker.date.future(),
        omschrijving: String(faker.lorem.lines(1)),
        status: faker.datatype.boolean(), // true => betaald, false => niet betaald
        klant_id: random_klant.id,
        gebruiker_id: gebruiker.id,
      });
    }
  }

  return verkopenfacturen;
}

async function seedLeveranciers(aantal: number)  {
  const leveranciers = [];
  const createdAddresses = await prisma.adres.findMany();
  const createdBedrijven = await prisma.gebruiker.findMany();

  for (let i = 0; i < aantal; i++) {
    const random_adres = createdAddresses[faker.number.int({ min: 0, max: createdAddresses.length - 1 })];
    const random_bedrijf = createdBedrijven[faker.number.int({ min: 0, max: createdBedrijven.length - 1 })];

    leveranciers.push({
      btw_nummer: String('BE' + faker.number.int({ min: 100000000, max: 999999999 })),
      bedrijfsnaam: String(faker.company.name()),
      telefoonnummer: String(faker.phone.number()),
      email: null, // Hier testen we ook eens null uit voor optionele velden!
      adres_id: Number(random_adres?.id),
      gebruiker_id: Number(random_bedrijf?.id),
    });
  }

  return leveranciers;
}

async function seedAankoopfacturen(aantal: number)  {
  const aankoopfacturen = [];
  const createdGebruikers = await prisma.gebruiker.findMany();

  // neem hier van elk bedrijf/gebruiker zijn leveranciers
  for (const gebruiker of createdGebruikers) {
    const createdLeveranciers = await prisma.leverancier.findMany({
      where: {
        gebruiker_id: gebruiker.id,
      },
    });

    // Als dit bedrijf/gebruiker geen leveranciers heeft, ga dan naar de volgende bedrijf
    if (createdLeveranciers.length === 0) continue;

    // voor elk bedrijf/gebruiker maak een aantal aankopen
    for (let i = 0; i < aantal; i++) {
      const random_leverancier = createdLeveranciers[
        faker.number.int({ min: 0, max: createdLeveranciers.length - 1 })
      ];

      if(random_leverancier === undefined) continue;

      aankoopfacturen.push({
        factuurnummer: String(faker.string.uuid()),
        factuurdatum: faker.date.anytime(),
        vervaldatum: faker.date.future(),
        omschrijving: String(faker.lorem.lines(1)),
        status: faker.datatype.boolean(), // true => betaald, false => niet betaald
        leverancier_id: random_leverancier.id, 
        gebruiker_id: gebruiker.id,
      });
    }
  }

  return aankoopfacturen;
}

async function seedAankopen(aantal: number) {
  const aankopen = [];
  const createdAankoopfacturen = await prisma.aankoopfactuur.findMany();
  const btw_percentages = [0.00, 0.06, 0.12, 0.21];

  for (const aankoopfactuur of createdAankoopfacturen) {
    for (let i = 0; i < aantal; i++) {
      // voor elke aankoopboeking neem een random hoofd_cagetorie en een bijhorende sub_categorie
      // Door de migration is deze tabel altijd gevuld
      
      const aankoopCategories = await prisma.aankoopCategorie.findMany();
      const random_categorie = aankoopCategories[faker.number.int({ min: 0, max: aankoopCategories.length - 1 })];

      let aantal_jaren_afschrijven = null;
      if (random_categorie?.hoofd_categorie === 'Investeringen') {
        aantal_jaren_afschrijven = faker.number.int({ min: 1, max: 10 });
      }
      aankopen.push({
        factuur_id: aankoopfactuur.id,
        bedrag: faker.finance.amount(),
        btw_percentage: btw_percentages[faker.number.int({ min: 0, max: btw_percentages.length - 1 })] ?? 0,
        prive_percentage: faker.number.float({ min: 0, max: 100 }),
        aankoop_categorie_id: random_categorie?.id ?? 0,
        aantal_jaren_afschrijven: aantal_jaren_afschrijven,
      });
    }
  }

  return aankopen;
}

async function seedVerkopen(aantal: number) {
  const verkopen = [];
  const createdVerkoopfacturen = await prisma.verkoopfactuur.findMany();
  const btw_percentages = await prisma.btwRegime.findMany();
  
  for (const verkoopfactuur of createdVerkoopfacturen) {
    for (let i = 0; i < aantal; i++) {
      verkopen.push({
        factuur_id: verkoopfactuur.id,
        omschrijving: faker.lorem.lines(1),
        bedrag: faker.finance.amount(),
        btw_percentage_id: btw_percentages[faker.number.int({ min: 0, max: btw_percentages.length - 1 })]?.id ?? 0,
      });
    }
  }
  return verkopen;
}

async function main() {
  
  // 500 adressen maken:
  const adressen = await seedAdressen(500);
  await prisma.adres.createMany({
    data: adressen,
  });

  // 10 bedrijven/gebruikers maken:
  const bedrijven = await seedGebruikers(10);
  await prisma.gebruiker.createMany({
    data: bedrijven,
  });

  // 20 klanten maken:
  const klanten = await seedklanten(20);
  await prisma.klant.createMany({
    data : klanten,
  });

  // 5 aankoopfacturen maken per bedrijf:
  const verkoopfacturen = await seedVerkoopfacturen(5);
  await prisma.verkoopfactuur.createMany({
    data : verkoopfacturen,
  });

  // 20 leveranciers maken:
  const leveranciers = await seedLeveranciers(20);
  await prisma.leverancier.createMany({
    data: leveranciers,
  });

  // 5 aankoopfacturen maken per bedrijf:
  const aankoopfacturen = await seedAankoopfacturen(5);
  await prisma.aankoopfactuur.createMany({
    data: aankoopfacturen,
  });

  // voor elk aankoopfactuur 2 aankopen boeken:
  const aankopen = await seedAankopen(2);
  await prisma.aankoop.createMany({
    data: aankopen,
  });

  // voor elk verkoopfactuur 2 verkopen boeken:
  const verkopen = await seedVerkopen(2);
  await prisma.verkoop.createMany({
    data: verkopen,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

