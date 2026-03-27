import type supertest from 'supertest';
import withServer from '../helpers/withServer';
import testAuthHeader from '../helpers/testAuthHeader';
import {login, loginAdmin} from '../helpers/login';
import { prisma } from '../../src/data';

const data = {
  adressen: [
    {
      id: 3,
      land: 'België',
      straat: 'Kerkstraat',
      nr: 1,
      stadsnaam: 'Brussel',
      postcode: '1000',
    },
    {
      id: 4,
      land: 'Nederland',
      straat: 'Dorpsstraat',
      nr: 1,
      stadsnaam: 'Amsterdam',
      postcode: '1000AA',
    },
  ],
  klanten : [
    {
      id: 1,
      btw_nummer: 'BE0123456789',
      bedrijfsnaam: 'Testbedrijf',
      voornaam: 'Jan',
      achternaam: 'Janssens',
      telefoonnummer: '0123456789',
      email: 'Jan.Janssens@outlook.com',
      adres_id: 3,
      gebruiker_id: 1,
    },
    {
      id: 2,
      btw_nummer: 'NL0123456788',
      bedrijfsnaam: 'Testbedrijf',
      voornaam: 'Jan',
      achternaam: 'Testings',
      telefoonnummer: '0123456789',
      email: 'Jan.Testings@outlook.com',
      adres_id: 4,
      gebruiker_id: 1,
    },
    {
      id: 3,
      btw_nummer: 'NL0123456738',
      bedrijfsnaam: 'Testbedrijf',
      voornaam: 'Jan',
      achternaam: 'Testings',
      telefoonnummer: '0123456789',
      email: 'Jan.Testings@outlook.com',
      adres_id: 4,
      gebruiker_id: 2,
    },
  ],
};

const dataToDelete = {
  adressen: [3, 4],
  klanten: [1, 2, 3],
  verkoopfacturen : [1, 2],
};

describe('Klanten', () => {

  let request: supertest.Agent;
  let authHeader: string;
  let adminAuthHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    authHeader = await login(request);
    adminAuthHeader = await loginAdmin(request);
  });

  const url = '/api/klanten'; 
  
  // --------------------------------------------------------------------------------------
  // GET /api/klanten testen:
  describe('GET /api/klanten', () => {

    // Voor elke test in klanten.spec.ts hebben we adresssen en klanten nodig:
    beforeAll(async () => {
      await prisma.adres.createMany({ data: data.adressen });
      await prisma.klant.createMany({ data: data.klanten });
    });
    
    // data terug verijwderen:
    afterAll(async () => {
      await prisma.klant.deleteMany({
        where: { id: { in: dataToDelete.klanten } },
      });
      await prisma.adres.deleteMany({
        where: { id: { in: dataToDelete.adressen } },
      });
    });
    
    // Testen of de status 200 is en of de klanten van de ingelogde gebruiker worden teruggegeven:
    it('should 200 and return all klanten for the signed in USER', async () => {
      const response = await request.get(url).set('Authorization', authHeader);
      expect(response.status).toBe(200);
      
      expect(response.body.items.length).toBe(2);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            btw_nummer: 'BE0123456789',
            bedrijfsnaam: 'Testbedrijf',
            voornaam: 'Jan',
            achternaam: 'Janssens',
            telefoonnummer: '0123456789',
            email: 'Jan.Janssens@outlook.com',
            adres: {
              id: 3,
              land: 'België',
              straat: 'Kerkstraat',
              nr: 1,
              stadsnaam: 'Brussel',
              postcode: '1000',
            },
            gebruiker: {
              id: 1,
            },
          }),
          expect.objectContaining({
            id: 2,
            btw_nummer: 'NL0123456788',
            bedrijfsnaam: 'Testbedrijf',
            voornaam: 'Jan',
            achternaam: 'Testings',
            telefoonnummer: '0123456789',
            email: 'Jan.Testings@outlook.com',
            adres: {
              id: 4,
              land: 'Nederland',
              straat: 'Dorpsstraat',
              nr: 1,
              stadsnaam: 'Amsterdam',
              postcode: '1000AA',
            },
            gebruiker: {
              id: 1,
            },
          }),
        ]),
      );
    });

    // Testen of de status 200 is en of de alle klanten worden teruggegeven voor een ADMIN:
    // Testen of de status 200 is en of de klanten van de ingelogde gebruiker worden teruggegeven:
    it('should 200 and return all klanten for the signed in ADMIN', async () => {
      const response = await request.get(url).set('Authorization', adminAuthHeader);
      expect(response.status).toBe(200);
      
      expect(response.body.items.length).toBe(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            btw_nummer: 'BE0123456789',
            bedrijfsnaam: 'Testbedrijf',
            voornaam: 'Jan',
            achternaam: 'Janssens',
            telefoonnummer: '0123456789',
            email: 'Jan.Janssens@outlook.com',
            adres: {
              id: 3,
              land: 'België',
              straat: 'Kerkstraat',
              nr: 1,
              stadsnaam: 'Brussel',
              postcode: '1000',
            },
            gebruiker: {
              id: 1,
            },
          }),
          expect.objectContaining({
            id: 2,
            btw_nummer: 'NL0123456788',
            bedrijfsnaam: 'Testbedrijf',
            voornaam: 'Jan',
            achternaam: 'Testings',
            telefoonnummer: '0123456789',
            email: 'Jan.Testings@outlook.com',
            adres: {
              id: 4,
              land: 'Nederland',
              straat: 'Dorpsstraat',
              nr: 1,
              stadsnaam: 'Amsterdam',
              postcode: '1000AA',
            },
            gebruiker: {
              id: 1,
            },
          }),
          expect.objectContaining({
            id: 3,
            btw_nummer: 'NL0123456738',
            bedrijfsnaam: 'Testbedrijf',
            voornaam: 'Jan',
            achternaam: 'Testings',
            telefoonnummer: '0123456789',
            email: 'Jan.Testings@outlook.com',
            adres: {
              id: 4,
              land: 'Nederland',
              straat: 'Dorpsstraat',
              nr: 1,
              stadsnaam: 'Amsterdam',
              postcode: '1000AA',
            },
            gebruiker: {
              id: 2,
            },
          }),
        ]),
      );
    });

    // Testen of de status 401 is als er geen token is:
    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });
    
    testAuthHeader(() => request.get(url));
  });

  // --------------------------------------------------------------------------------------

  // GET /api/klanten/:id testen:
  describe('GET /api/klanten/:id', () => {

    // Voor elke test in klanten.spec.ts hebben we adresssen en klanten nodig:
    beforeAll(async () => {
      await prisma.adres.createMany({ data: data.adressen });
      await prisma.klant.createMany({ data: data.klanten });
    });
    
    // data terug verijwderen:
    afterAll(async () => {
      await prisma.klant.deleteMany({
        where: { id: { in: dataToDelete.klanten } },
      });
      await prisma.adres.deleteMany({
        where: { id: { in: dataToDelete.adressen } },
      });
    });

    // Testen of de status 200 is en of de klant met het gegeven id wordt teruggegeven:
    it('should 200 and return the klant with the given id for USER', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', authHeader);
      expect(response.status).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          btw_nummer: 'BE0123456789',
          bedrijfsnaam: 'Testbedrijf',
          voornaam: 'Jan',
          achternaam: 'Janssens',
          telefoonnummer: '0123456789',
          email: 'Jan.Janssens@outlook.com',
          adres: {
            id: 3,
            land: 'België',
            straat: 'Kerkstraat',
            nr: 1,
            stadsnaam: 'Brussel',
            postcode: '1000',
          },
        }),
      );
    });

    // Testen of de status 200 is en of de klant met het gegeven id wordt teruggegeven voor ADMIN:
    it('should 200 and return the klant with the given id for ADMIN', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', adminAuthHeader);
      expect(response.status).toBe(200);

      // Deze klant is niet van de admin
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          btw_nummer: 'BE0123456789',
          bedrijfsnaam: 'Testbedrijf',
          voornaam: 'Jan',
          achternaam: 'Janssens',
          telefoonnummer: '0123456789',
          email: 'Jan.Janssens@outlook.com',
          adres: {
            id: 3,
            land: 'België',
            straat: 'Kerkstraat',
            nr: 1,
            stadsnaam: 'Brussel',
            postcode: '1000',
          },
        }),
      );
    });

    // Testen of de status 404 is als de klant niet bestaat ADMIN:
    it('should 200 and return the klant with the given id for ADMIN', async () => {
      const response = await request.get(`${url}/8`).set('Authorization', adminAuthHeader);
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Klant met id 8 bestaat niet!',
      });
      expect(response.body.stack).toBeTruthy();
    });

    // Testen of de status 404 is als de klant niet bestaat USER:
    it('should 404 when requesting not owned klant for USER', async () => {
      const response = await request.get(`${url}/3`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Klant met id 3 bestaat niet!',
      });
      expect(response.body.stack).toBeTruthy();
    });

    // Testen of de status 400 is als het klant id ongeldig is (bv een string):
    it('should 400 with invalid klant id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });
  // --------------------------------------------------------------------------------------
  
  // GET /api/klanten testen:
  describe('POST /api/klanten', () => {
    const klantenToDelete: number[] = [];
    const adressenToDelete: number[] = [];
    
    // data terug verijwderen:
    afterAll(async () => {

      await prisma.klant.deleteMany({
        where: { id: { in: klantenToDelete } },
      });

      await prisma.adres.deleteMany({
        where: { id: { in: adressenToDelete } },
      });
    });
    
    it('should 201 and return the created klanten USER', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();

      expect(response.body.btw_nummer).toBe('BE0123456777');
      expect(response.body.bedrijfsnaam).toBe('Testbedrijf');
      expect(response.body.voornaam).toBe('Jan');
      expect(response.body.achternaam).toBe('Janssens');
      expect(response.body.telefoonnummer).toBe('0123456789');
      expect(response.body.email).toBe('testCreate@outlook.com');
      expect(response.body.adres).toEqual({
        id: response.body.adres.id, 
        land: 'België',
        straat: 'Kerkstraat',
        nr: 1,
        stadsnaam: 'Brussel',
        postcode: '1000',
      });
      
      klantenToDelete.push(response.body.id);
      adressenToDelete.push(response.body.adres.id);
    });

    // Missing btw_nummer
    it('should 400 when missing btw_nummer', async () => {
      const response = await request.post(url).send({
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('btw_nummer');
    });

    // Missing bedrijfsnaam
    it('should 400 when missing bedrijfsnaam', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('bedrijfsnaam');
    });

    // Missing voornaam
    it('should 400 when missing voornaam', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('voornaam');
    });

    // Missing achternaam
    it('should 400 when missing achternaam', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('achternaam');
    });

    // Missing telefoonnummer
    it('should 400 when missing telefoonnummer', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('telefoonnummer');
    });

    // Missing email
    it('should 400 when missing email', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    // Missing adres
    it('should 400 when missing adres', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('adres');
    });

    // Missing adres.land
    it('should 400 when missing email', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.land'][0]).toMatchObject({
        message: '"adres.land" is required',
        type: 'any.required',
      });
    });

    // Missing adres.straat
    it('should 400 when missing straat', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.straat'][0]).toMatchObject({
        message: '"adres.straat" is required',
        type: 'any.required',
      });
    });

    // Missing adres.straat
    it('should 400 when missing nr', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.nr'][0]).toMatchObject({
        message: '"adres.nr" is required',
        type: 'any.required',
      });
    });

    // Missing adres.stadsnaam
    it('should 400 when missing stadsnaam', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          nr: 1,
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.stadsnaam'][0]).toMatchObject({
        message: '"adres.stadsnaam" is required',
        type: 'any.required',
      });
    });

    // Missing adres.postcode
    it('should 400 when missing postcode', async () => {
      const response = await request.post(url).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.postcode'][0]).toMatchObject({
        message: '"adres.postcode" is required',
        type: 'any.required',
      });
    });

    testAuthHeader(() => request.post(url));
  });

  // --------------------------------------------------------------------------------------

  // PUT /api/klanten/:id testen:
  describe('PUT /api/klanten/:id', () => {
    
    beforeAll(async () => {
      await prisma.adres.createMany({ data: data.adressen });
      await prisma.klant.createMany({ data: data.klanten });
    });
    
    afterAll(async () => {
      await prisma.klant.deleteMany({
        where: { id: { in: dataToDelete.klanten } },
      });

      await prisma.adres.deleteMany({
        where: { id: { in: dataToDelete.adressen } },
      });
    });

    it('should 200 and return the updated klant by USER', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'updatedEmail@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      }) 
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          btw_nummer: 'BE0123456777',
          bedrijfsnaam: 'Testbedrijf',
          voornaam: 'Jan',
          achternaam: 'Janssens',
          telefoonnummer: '0123456789',
          email: 'updatedEmail@outlook.com',
          adres: {
            id: 3,
            land: 'België',
            straat: 'Kerkstraat',
            nr: 1,
            stadsnaam: 'Brussel',
            postcode: '1000',
          },
        }));
    });

    it('should 200 and return the updated klant by ADMIN', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'updatedEmail@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      }) 
        .set('Authorization', adminAuthHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          btw_nummer: 'BE0123456777',
          bedrijfsnaam: 'Testbedrijf',
          voornaam: 'Jan',
          achternaam: 'Janssens',
          telefoonnummer: '0123456789',
          email: 'updatedEmail@outlook.com',
          adres: {
            id: 3,
            land: 'België',
            straat: 'Kerkstraat',
            nr: 1,
            stadsnaam: 'Brussel',
            postcode: '1000',
          },
        }));
    });

    it('should 404 when updating klant not existing', async () => {
      const response = await request.put(`${url}/2000`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'updatedEmail@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      }) 
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Klant met id 2000 bestaat niet!',
      });
      expect(response.body.stack).toBeTruthy();
    });

    // Missing btw_nummer
    it('should 400 when missing btw_nummer', async () => {
      const response = await request.put(`${url}/1`).send({
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('btw_nummer');
    });

    // Missing bedrijfsnaam
    it('should 400 when missing bedrijfsnaam', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('bedrijfsnaam');
    });

    // Missing voornaam
    it('should 400 when missing voornaam', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('voornaam');
    });

    // Missing achternaam
    it('should 400 when missing achternaam', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('achternaam');
    });

    // Missing telefoonnummer
    it('should 400 when missing telefoonnummer', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        email: 'testCreate@outlook.com',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('telefoonnummer');
    });

    // Missing email
    it('should 400 when missing email', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        adres: {
          land: 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    // Missing adres
    it('should 400 when missing adres', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('adres');
    });

    // Missing adres.land
    it('should 400 when missing email', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.land'][0]).toMatchObject({
        message: '"adres.land" is required',
        type: 'any.required',
      });
    });

    // Missing adres.straat
    it('should 400 when missing straat', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          nr: 1,
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.straat'][0]).toMatchObject({
        message: '"adres.straat" is required',
        type: 'any.required',
      });
    });

    // Missing adres.straat
    it('should 400 when missing nr', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          stadsnaam: 'Brussel',
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.nr'][0]).toMatchObject({
        message: '"adres.nr" is required',
        type: 'any.required',
      });
    });

    // Missing adres.stadsnaam
    it('should 400 when missing stadsnaam', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          nr: 1,
          postcode: '1000',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.stadsnaam'][0]).toMatchObject({
        message: '"adres.stadsnaam" is required',
        type: 'any.required',
      });
    });

    // Missing adres.postcode
    it('should 400 when missing postcode', async () => {
      const response = await request.put(`${url}/1`).send({
        btw_nummer: 'BE0123456777',
        bedrijfsnaam: 'Testbedrijf',
        voornaam: 'Jan',
        achternaam: 'Janssens',
        telefoonnummer: '0123456789',
        email: 'testCreate@outlook.com',
        adres: {
          land : 'België',
          straat: 'Kerkstraat',
          nr: 1,
          stadsnaam: 'Brussel',
        },
      })
        .set('Authorization', authHeader);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body['adres.postcode'][0]).toMatchObject({
        message: '"adres.postcode" is required',
        type: 'any.required',
      });
    });

    testAuthHeader(() => request.post(url));
  });
  // --------------------------------------------------------------------------------------

  // DELETE /api/klanten/:id testen:
  describe('DELETE /api/klanten/:id', () => {

    beforeAll(async () => {
      await prisma.adres.createMany({ data: data.adressen });
      await prisma.klant.createMany({ data: data.klanten });
    });
    
    afterAll(async () => {
      await prisma.klant.deleteMany({
        where: { id: { in: dataToDelete.klanten } },
      });

      await prisma.adres.deleteMany({
        where: { id: { in: dataToDelete.adressen } },
      });
    });

    it('should 204 and delete the klant by USER', async () => {
      const response = await request.delete(`${url}/1`).set('Authorization', authHeader);
      expect(response.status).toBe(204);
    });

    it('should 204 and delete the klant by ADMIN', async () => {
      const response = await request.delete(`${url}/2`).set('Authorization', adminAuthHeader);
      expect(response.status).toBe(204);
    });

    it('should 404 when deleting klant not existing', async () => {
      const response = await request.delete(`${url}/2000`).set('Authorization', authHeader);
      expect(response.statusCode).toBe(404);
      expect(response.body.stack).toBeTruthy();
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
   