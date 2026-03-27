import Router from '@koa/router';
import * as klantService from '../service/klant';
import * as VerkoopfactuurService from '../service/verkoopfactuur';
import type { BoekhoudAppContext, BoekhoudAppState, KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateKlantRequest,
  UpdateKlantRequest,
  GetAllKlantenResponse,
  GetKlantByIdResponse,
  CreateKlantResponse,
  UpdateKlantResponse,
} from '../types/klant';
import type { IdParams } from '../types/common';
import type { GetAllVerkoopfacturenResponse } from '../types/verkoopfactuur';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @swagger
 * tags:
 *   name: Klanten
 *   description: Beheer van klanten.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Klant:
 *       type: object
 *       required:
 *         - id
 *         - btw_nummer
 *         - bedrijfsnaam
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
 *           nullable: true
 *         achternaam:
 *           type: string
 *           nullable: true
 *         telefoonnummer:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
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
 *     KlantCreateInput:
 *       type: object
 *       required:
 *         - btw_nummer
 *         - bedrijfsnaam
 *         - adres
 *       properties:
 *         btw_nummer:
 *           type: string
 *         bedrijfsnaam:
 *           type: string
 *         voornaam:
 *           type: string
 *           nullable: true
 *         achternaam:
 *           type: string
 *           nullable: true
 *         telefoonnummer:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
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
 *     KlantUpdateInput:
 *       type: object
 *       required:
 *         - btw_nummer
 *         - bedrijfsnaam
 *         - adres
 *       properties:
 *         btw_nummer:
 *           type: string
 *         bedrijfsnaam:
 *           type: string
 *         voornaam:
 *           type: string
 *           nullable: true
 *         achternaam:
 *           type: string
 *           nullable: true
 *         telefoonnummer:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
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
 */

/**
 * @swagger
 * /klanten:
 *   get:
 *     summary: Haal alle klanten op
 *     tags:
 *       - Klanten
 *     responses:
 *       200:
 *         description: Lijst van klanten
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Klant"
 */
const getAllKlanten = async (ctx: KoaContext<GetAllKlantenResponse>) => {
  const klanten = await klantService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = {
    items: klanten,
  };
};

getAllKlanten.validationScheme = null;

/**
 * @swagger
 * /klanten/{id}:
 *   get:
 *     summary: Haal klant op door ID
 *     tags:
 *       - Klanten
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de klant
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Gegevens van de klant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Klant"
 */
const getKlantById = async (ctx: KoaContext<GetKlantByIdResponse, IdParams>) => {
  const klant = await klantService.getById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = klant;
};

getKlantById.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
};

/**
 * @swagger
 * /klanten:
 *   post:
 *     summary: Maak een nieuwe klant aan
 *     tags:
 *       - Klanten
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/KlantCreateInput"
 *     responses:
 *       201:
 *         description: Nieuwe klant succesvol aangemaakt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Klant"
 */
const createKlant = async (ctx: KoaContext<CreateKlantResponse, void, CreateKlantRequest>) => {
  const newKlant = await klantService.create({
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.status = 201;
  ctx.body = newKlant;
};

createKlant.validationScheme = {
  body: {
    btw_nummer: Joi.string(),
    bedrijfsnaam: Joi.string(),
    voornaam: Joi.string().allow(null),
    achternaam: Joi.string().allow(null),
    telefoonnummer: Joi.string().allow(null),
    email: Joi.string().allow(null),
    adres: Joi.object({
      land: Joi.string(),
      straat: Joi.string(),
      nr: Joi.number(),
      stadsnaam: Joi.string(),
      postcode: Joi.string(),
    }),
  },
};

/**
 * @swagger
 * /klanten/{id}:
 *   put:
 *     summary: Werk klantgegevens bij
 *     tags:
 *       - Klanten
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de klant
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/KlantUpdateInput"
 *     responses:
 *       200:
 *         description: Gewijzigde klantgegevens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Klant"
 */
const updateKlant = async (ctx: KoaContext<UpdateKlantResponse, IdParams, UpdateKlantRequest>) => {
  const updatedKlant = await klantService.updateById(ctx.params.id, {
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
    rollen: ctx.state.session.rollen,
  });
  ctx.body = updatedKlant;
};

updateKlant.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
  body: {
    btw_nummer: Joi.string(),
    bedrijfsnaam: Joi.string(),
    voornaam: Joi.string().allow(null),
    achternaam: Joi.string().allow(null),
    telefoonnummer: Joi.string().allow(null),
    email: Joi.string().allow(null),
    adres: Joi.object({
      land: Joi.string(),
      straat: Joi.string(),
      nr: Joi.number().positive(),
      stadsnaam: Joi.string(),
      postcode: Joi.string(),
    }),
  },
};

/**
 * @swagger
 * /klanten/{id}:
 *   delete:
 *     summary: Verwijder een klant
 *     tags:
 *       - Klanten
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de klant
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Klant succesvol verwijderd
 */
const deleteKlant = async (ctx: KoaContext<void, IdParams>) => {
  await klantService.deleteById(
    ctx.params.id, 
    ctx.state.session.gebruikerId,
    ctx.state.session.rollen,  
  );
  ctx.status = 204;
};

deleteKlant.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
};

/**
 * @swagger
 * /klanten/{id}/verkoopfacturen:
 *   get:
 *     summary: Haal verkoopfacturen op voor een klant
 *     tags:
 *       - Klanten
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de klant
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lijst van verkoopfacturen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Verkoopfactuur"
 */
const getAllVerkoopfacturenByKlantId = async (ctx: KoaContext<GetAllVerkoopfacturenResponse, IdParams>) => {
  const verkoopfacturen = 
    await VerkoopfactuurService.getAllByKlantId(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = {
    items: verkoopfacturen,
  };
};

getAllVerkoopfacturenByKlantId.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/klanten',
  });

  router.use(requireAuthentication);

  router.get(
    '/', 
    validate(getAllKlanten.validationScheme),
    getAllKlanten,
  );

  router.get(
    '/:id', 
    validate(getKlantById.validationScheme),
    getKlantById,
  );

  router.post(
    '/',
    validate(createKlant.validationScheme),  
    createKlant,
  );
  
  router.put(
    '/:id', 
    validate(updateKlant.validationScheme),
    updateKlant,
  );

  router.delete(
    '/:id', 
    validate(deleteKlant.validationScheme),
    deleteKlant,
  );

  router.get(
    '/:id/verkoopfacturen', 
    validate(getAllVerkoopfacturenByKlantId.validationScheme),
    getAllVerkoopfacturenByKlantId,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
