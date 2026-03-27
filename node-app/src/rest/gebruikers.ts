import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  GetAllGebruikersResponse,
  GetGebruikerByIdResponse,
  UpdateBedrijfResponse,
  LoginResponse,
  UpdateGebruikerRequest,
  RegiserUserRequest,
  GetUserRequest,
} from '../types/gebruiker';
import type { IdParams } from '../types/common';
import * as gebruikerService from '../service/gebruiker';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication, makeRequireRole, authDelay } from '../core/auth';
import Role from '../core/roles';
import type { Next } from 'koa';

/**
 * @swagger
 * tags:
 *   name: Gebruikers
 *   description: Beheer van gebruikers.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Gebruiker:
 *       type: object
 *       required:
 *         - id
 *         - btw_nummer
 *         - bedrijfsnaam
 *         - voornaam
 *         - achternaam
 *         - telefoonnummer
 *         - email
 *         - adres
 *       properties:
 *         id:
 *           type: integer
 *         btw_nummer:
 *           type: string
 *         bedrijfsnaam:
 *           type: string
 *         voornaam:
 *           type: string
 *         achternaam:
 *           type: string
 *         telefoonnummer:
 *           type: string
 *         email:
 *           type: string
 *         adres:
 *           type: object
 *           properties:
 *             land:
 *               type: string
 *             straat:
 *               type: string
 *             nr:
 *               type: integer
 *             stadsnaam:
 *               type: string
 *             postcode:
 *               type: string
 *       example:
 *         id: 1
 *         btw_nummer: "NL123456789B01"
 *         bedrijfsnaam: "Example Company"
 *         voornaam: "John"
 *         achternaam: "Doe"
 *         telefoonnummer: "0612345678"
 *         email: "john.doe@example.com"
 *         adres:
 *           land: "Nederland"
 *           straat: "Hoofdstraat"
 *           nr: 1
 *           stadsnaam: "Amsterdam"
 *           postcode: "1000AA"
 *     GebruikersList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Gebruiker"
 */

/**
 * @swagger
 * /gebruikers:
 *   post:
 *     summary: Registreer een nieuwe gebruiker
 *     tags:
 *       - Gebruikers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Gebruiker"
 *     responses:
 *       200:
 *         description: JWT-token voor de ingelogde gebruiker.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Ongeldige aanvraag
 *       409:
 *         description: Gebruiker bestaat al
 */
const registerUser = async (ctx: KoaContext<LoginResponse, void, RegiserUserRequest>) => {
  const token = await gebruikerService.registerUser(ctx.request.body);
  ctx.status = 200;
  ctx.body = { token };
};

registerUser.validationScheme = {
  body: {
    btw_nummer: Joi.string().max(50),
    bedrijfsnaam: Joi.string().max(255),
    voornaam: Joi.string().max(255),
    achternaam: Joi.string().max(255),
    telefoonnummer: Joi.string().max(50),
    email: Joi.string().max(255),
    adres: {
      land: Joi.string().max(255),
      straat: Joi.string().max(255),
      nr: Joi.number().integer().positive(),
      stadsnaam: Joi.string().max(255),
      postcode: Joi.string().max(10),
    },
    wachtwoord: Joi.string().min(12).max(255),
  },
};

/**
 * @swagger
 * /gebruikers:
 *   get:
 *     summary: Haal alle gebruikers op
 *     tags:
 *       - Gebruikers
 *     responses:
 *       200:
 *         description: Lijst van alle gebruikers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GebruikersList"
 *       403:
 *         description: Je hebt geen toestemming om deze bron te benaderen
 */
const getAllGebruikers = async (ctx: KoaContext<GetAllGebruikersResponse>) => {
  const bedrijven = await gebruikerService.getAll();
  ctx.body = {
    items: bedrijven,
  };
};

getAllGebruikers.validationScheme = null;

/**
 * @swagger
 * /gebruikers/{id}:
 *   get:
 *     summary: Haal een specifieke gebruiker op
 *     tags:
 *       - Gebruikers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de gebruiker of 'me' om de ingelogde gebruiker op te halen
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Gegevens van de specifieke gebruiker
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Gebruiker"
 *       404:
 *         description: Gebruiker niet gevonden
 *       403:
 *         description: Je kunt alleen je eigen gegevens opvragen, tenzij je een admin bent
 */
const getGebruikerById = async (ctx: KoaContext<GetGebruikerByIdResponse, GetUserRequest>) => {
  const user = await gebruikerService.getById(
    ctx.params.id === 'me' ? ctx.state.session.gebruikerId : ctx.params.id, 
  );
  ctx.status = 200;
  ctx.body = user;
};

getGebruikerById.validationScheme = {
  params: {
    id: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().valid('me'),
    ),
  },
};

/**
 * @swagger
 * /gebruikers/{id}:
 *   put:
 *     summary: Werk de gegevens van een gebruiker bij
 *     tags:
 *       - Gebruikers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de gebruiker
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Gebruiker"
 *     responses:
 *       200:
 *         description: Gewijzigde gegevens van de gebruiker
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Gebruiker"
 *       404:
 *         description: Gebruiker niet gevonden
 *       403:
 *         description: Je kunt alleen je eigen gegevens bijwerken, tenzij je een admin bent
 */
const updateGebruiker = async (ctx: KoaContext<UpdateBedrijfResponse, IdParams, UpdateGebruikerRequest>) => {
  const updatedBedrijf = await gebruikerService.updateById(ctx.params.id, ctx.request.body);
  ctx.body = updatedBedrijf;
};

updateGebruiker.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    btw_nummer: Joi.string(),
    bedrijfsnaam: Joi.string(),
    voornaam: Joi.string(),
    achternaam: Joi.string(),
    telefoonnummer: Joi.string(),
    email: Joi.string(),
    adres: {
      land: Joi.string(),
      straat: Joi.string(),
      nr: Joi.number().integer().positive(),
      stadsnaam: Joi.string(),
      postcode: Joi.string(),
    },
  },
};

/**
 * @swagger
 * /gebruikers/{id}:
 *   delete:
 *     summary: Verwijder een gebruiker door ID
 *     tags:
 *       - Gebruikers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de gebruiker
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Gebruiker succesvol verwijderd
 *       404:
 *         description: Gebruiker niet gevonden
 *       403:
 *         description: Je kunt alleen je eigen gegevens verwijderen, tenzij je een admin bent
 */
const deleteGebruiker = async (ctx: KoaContext<void, IdParams>) => {
  await gebruikerService.deleteById(ctx.params.id); 
  ctx.status = 204;
};

deleteGebruiker.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

// ---------------------------------------------------------------------------
// Interne methode om te checken of gebruiker al al dan niet bestaat
const checkUserId = (ctx: KoaContext<unknown, GetUserRequest>, next: Next) => {
  const { gebruikerId, rollen } = ctx.state.session;
  const { id } = ctx.params;
  
  if (id !== 'me' && id !== gebruikerId && !rollen.includes(Role.ADMIN)) {
    return ctx.throw(
      404,
      'You can only get your own data unless you are an admin',
      { code: 'FORBIDDEN' },
    );
  }
  return next();
};
// ---------------------------------------------------------------------------

export default function installUserRoutes(parent: KoaRouter) {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/gebruikers',
  });

  router.post(
    '/', 
    validate(registerUser.validationScheme),
    authDelay,
    registerUser,
  );

  const requireAdmin = makeRequireRole(Role.ADMIN);

  router.get(
    '/',
    requireAuthentication, 
    requireAdmin,
    validate(getAllGebruikers.validationScheme),
    getAllGebruikers,
  );

  router.get(
    '/:id',
    requireAuthentication,
    validate(getGebruikerById.validationScheme),
    checkUserId,
    getGebruikerById,
  );

  router.put(
    '/:id',
    requireAuthentication,
    validate(updateGebruiker.validationScheme),
    checkUserId,
    updateGebruiker,
  );

  router.delete(
    '/:id',
    requireAuthentication,
    validate(deleteGebruiker.validationScheme),
    checkUserId,
    deleteGebruiker,
  );
  
  parent.use(router.routes()).use(router.allowedMethods());
};
