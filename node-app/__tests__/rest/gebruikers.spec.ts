import type supertest from 'supertest';
import withServer from '../helpers/withServer';
import { login, loginAdmin } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

describe('Users', () => {

  let request: supertest.Agent;
  let authHeader: string;
  let adminAuthHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    authHeader = await login(request);
    adminAuthHeader = await loginAdmin(request);
  });

  const url = '/api/gebruikers';

  describe('GET /api/gebruikers', () => {

    it('should 200 and return all users for an admin', async () => {
      const response = await request.get(url).set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.items).toEqual(expect.arrayContaining([
        {
          id: 1,
          btw_nummer: 'BE0123456789',
          bedrijfsnaam: 'Test Bedrijf',
          voornaam: 'Test User',
          achternaam: 'Test User',
          telefoonnummer: '0123456789',
          email: 'test.user@hogent.be',
          adres : {
            id: 1,
            land: 'België',
            straat: 'Schoonmeersstraat',
            nr: 52,
            stadsnaam: 'Gent',
            postcode: '9000',
          },
        },
        {
          id: 2,
          btw_nummer: 'BE0123456780',
          bedrijfsnaam: 'Admin Bedrijf',
          voornaam: 'Test Admin',
          achternaam: 'Test Admin',
          telefoonnummer: '0123456789',
          email: 'test.admin@hogent.be',
          adres : {
            id: 1,
            land: 'België',
            straat: 'Schoonmeersstraat',
            nr: 52,
            stadsnaam: 'Gent',
            postcode: '9000',
          },
        },
      ]));
    });

    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });

    it('should 403 when not an admin', async () => {
      const response = await request.get(url).set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this part of the application',
      });
    });

    testAuthHeader(() => request.get(url));
  });
  
  describe('GET /api/gebruikers/:id', () => {

    it('should 200 and return the requested user', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        btw_nummer: 'BE0123456789',
        bedrijfsnaam: 'Test Bedrijf',
        voornaam: 'Test User',
        achternaam: 'Test User',
        telefoonnummer: '0123456789',
        email: 'test.user@hogent.be',
        adres : {
          id: 1,
          land: 'België',
          straat: 'Schoonmeersstraat',
          nr: 52,
          stadsnaam: 'Gent',
          postcode: '9000',
        },
      });
    });

    it('should 200 and return my user info when passing \'me\' as id', async () => {
      const response = await request.get(`${url}/me`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        btw_nummer: 'BE0123456789',
        bedrijfsnaam: 'Test Bedrijf',
        voornaam: 'Test User',
        achternaam: 'Test User',
        telefoonnummer: '0123456789',
        email: 'test.user@hogent.be',
        adres : {
          id: 1,
          land: 'België',
          straat: 'Schoonmeersstraat',
          nr: 52,
          stadsnaam: 'Gent',
          postcode: '9000',
        },
      });
    });

    it('should 404 with not existing user (and admin user requesting)', async () => {
      const response = await request.get(`${url}/123`).set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Bedrijf met id 123 bestaat niet!',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid user id (and admin user requesting)', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', adminAuthHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    it('should 403 when not an admin and not own user id', async () => {
      const response = await request.get(`${url}/2`).set('Authorization', authHeader);

      // Hier 404 om voor te zorgen dat mensen niet weten dat er nog een gebruiker met id 2 bestaat
      expect(response.statusCode).toBe(404); 
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You can only get your own data unless you are an admin',
      });
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('PUT /api/gebruikers/:id', () => {

    it('should 200 and return the updated user', async () => {
      const response = await request.put(`${url}/1`)
        .send({
          btw_nummer: 'BE0111111111',
          bedrijfsnaam: 'Test Bedrijf',
          voornaam: 'Test User',
          achternaam: 'Test User',
          telefoonnummer: '0123456789',
          email: 'test.user@hogent.be',
          adres : {
            land: 'België',
            straat: 'Schoonmeersstraat',
            nr: 52,
            stadsnaam: 'Gent',
            postcode: '9000',
          },
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        btw_nummer: 'BE0111111111',
        bedrijfsnaam: 'Test Bedrijf',
        voornaam: 'Test User',
        achternaam: 'Test User',
        telefoonnummer: '0123456789',
        email: 'test.user@hogent.be',
        adres : {
          id: 1,
          land: 'België',
          straat: 'Schoonmeersstraat',
          nr: 52,
          stadsnaam: 'Gent',
          postcode: '9000',
        },
      });
    });

    it('should 403 when not an admin and not own user id', async () => {
      const response = await request.put(`${url}/2`)
        .send({
          btw_nummer: 'BE0111111111',
          bedrijfsnaam: 'Test Bedrijf',
          voornaam: 'Test User',
          achternaam: 'Test User',
          telefoonnummer: '0123456789',
          email: 'test.user@hogent.be',
          adres : {
            land: 'België',
            straat: 'Schoonmeersstraat',
            nr: 52,
            stadsnaam: 'Gent',
            postcode: '9000',
          },
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You can only get your own data unless you are an admin',
      });
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/gebruikers/:id', () => {

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing user', async () => {
      const response = await request.delete(`${url}/123`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You can only get your own data unless you are an admin',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 404 when not an admin and not own user id', async () => {
      const response = await request.delete(`${url}/2`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You can only get your own data unless you are an admin',
      });
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });

});