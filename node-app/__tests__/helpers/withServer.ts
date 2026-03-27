// __tests__/helpers/withServer.ts
import supertest from 'supertest'; 
import type { Server } from '../../src/createServer'; 
import createServer from '../../src/createServer'; 
import { prisma } from '../../src/data'; 
import { hashPassword } from '../../src/core/password'; 
import Role from '../../src/core/roles';

export default function withServer(setter: (s: supertest.Agent) => void): void {
  let server: Server; 

  beforeAll(async () => {
    server = await createServer();

    // 1. Een adres aanmaken voor de gebruiker:
    await prisma.adres.create({
      data: {
        id: 1,
        land: 'België',
        straat: 'Schoonmeersstraat',
        nr: 52,
        stadsnaam: 'Gent',
        postcode: '9000',
      },
    });

    // 2. Aanmaken van een gebruiker met adres:
    const passwordHash = await hashPassword('12345678');
    await prisma.gebruiker.createMany({
      data: [
        {
          id: 1,
          btw_nummer: 'BE0123456789',
          bedrijfsnaam: 'Test Bedrijf',
          voornaam: 'Test User',
          achternaam: 'Test User',
          telefoonnummer: '0123456789',
          email: 'test.user@hogent.be',
          wachtwoord_hash: passwordHash,
          rollen: JSON.stringify([Role.USER]),
          adres_id: 1,
        },
        {
          id: 2,
          btw_nummer: 'BE0123456780',
          bedrijfsnaam: 'Admin Bedrijf',
          voornaam: 'Test Admin',
          achternaam: 'Test Admin',
          telefoonnummer: '0123456789',
          email: 'test.admin@hogent.be',
          wachtwoord_hash: passwordHash,
          rollen: JSON.stringify([Role.ADMIN, Role.USER]),
          adres_id: 1,
        },
      ],
    });

    setter(supertest(server.getApp().callback()));
  });

  afterAll(async () => {
    await prisma.klant.deleteMany();
    await prisma.leverancier.deleteMany();
    await prisma.adres.deleteMany();
    await prisma.verkoop.deleteMany();
    await prisma.verkoopfactuur.deleteMany();
    await prisma.aankoop.deleteMany();
    await prisma.aankoopfactuur.deleteMany();
    await prisma.gebruiker.deleteMany();

    await server.stop();
  });
}
