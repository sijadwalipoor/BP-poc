import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateAankoopfactuurRequest, 
  UpdateAankoopfactuurRequest,
  GetAllAankoopfacturenResponse,
  GetAankoopfactuurByIdResponse,
  CreateAankoopfactuurResponse,
  UpdateAankoopfactuurResponse,
} from '../types/aankoopfactuur';
import type { IdParams } from '../types/common';

import * as AankoopfactuurService from '../service/aankoopfactuur';
import * as AankoopService from '../service/aankoop';
import type { GetAllAankopenResponse } from '../types/aankoop';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @swagger
 * tags:
 *   name: Aankoopfacturen
 *   description: De facturen die behoren bij aankopen.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Aankoopfactuur:
 *       type: object
 *       required:
 *         - id
 *         - factuurnummer
 *         - factuurdatum
 *         - vervaldatum
 *         - omschrijving
 *         - status
 *         - leverancier_id
 *       properties:
 *         id:
 *           type: integer
 *         factuurnummer:
 *           type: string
 *         factuurdatum:
 *           type: string
 *           format: date
 *         vervaldatum:
 *           type: string
 *           format: date
 *         omschrijving:
 *           type: string
 *         status:
 *           type: boolean
 *         leverancier_id:
 *           type: integer
 *       example:
 *         id: 123
 *         factuurnummer: "AB12345"
 *         factuurdatum: "2025-01-01"
 *         vervaldatum: "2025-01-31"
 *         omschrijving: "Voorraad aankoop"
 *         status: true
 *         leverancier_id: 45
 *     AankoopfacturenList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Aankoopfactuur"
 */

/**
 * @swagger
 * /aankoopfacturen:
 *   get:
 *     summary: Haal alle aankoopfacturen op
 *     tags:
 *       - Aankoopfacturen
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lijst van alle aankoopfacturen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AankoopfacturenList"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllAankoopfacturen = async (ctx: KoaContext<GetAllAankoopfacturenResponse>) => {
  const aankoopfacturen = await AankoopfactuurService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = {
    items: aankoopfacturen,
  };
};
getAllAankoopfacturen.validationScheme = null;

/**
 * @swagger
 * /aankoopfacturen/{id}:
 *   get:
 *     summary: Haal een specifieke aankoopfactuur op
 *     tags:
 *       - Aankoopfacturen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoopfactuur
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Gegevens van de aankoopfactuur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoopfactuur"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAankoopfactuurById = async (ctx: KoaContext<GetAankoopfactuurByIdResponse, IdParams>) => {
  const Aankoopfactuur = await AankoopfactuurService.getById(ctx.params.id, ctx.state.session.gebruikerId, 
    ctx.state.session.rollen);
  ctx.body = Aankoopfactuur;
};

getAankoopfactuurById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /aankoopfacturen:
 *   post:
 *     summary: Maak een nieuwe aankoopfactuur aan
 *     tags:
 *       - Aankoopfacturen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Aankoopfactuur"
 *     responses:
 *       201:
 *         description: De aangemaakte aankoopfactuur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoopfactuur"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const createAankoopfactuur = async (ctx: KoaContext<CreateAankoopfactuurResponse, 
  void, CreateAankoopfactuurRequest>) => {
  const newAankoopfactuur = await AankoopfactuurService.create({
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.status = 201;
  ctx.body = newAankoopfactuur;
};

createAankoopfactuur.validationScheme = {
  body: {
    factuurnummer: Joi.string().required(),
    factuurdatum: Joi.date().required(),
    vervaldatum: Joi.date().min(Joi.ref('factuurdatum')).required(),
    omschrijving: Joi.string().required(),
    status: Joi.boolean().required(),
    leverancier_id: Joi.number().integer().positive().required(),
  },
};

/**
 * @swagger
 * /aankoopfacturen/{id}:
 *   put:
 *     summary: Werk een bestaande aankoopfactuur bij
 *     tags:
 *       - Aankoopfacturen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de factuur
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Aankoopfactuur"
 *     responses:
 *       200:
 *         description: De geüpdatete aankoopfactuur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoopfactuur"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const updateAankoopfactuur = async (ctx: KoaContext<UpdateAankoopfactuurResponse,
  IdParams, UpdateAankoopfactuurRequest>) => {
  const updatedAankoopfactuur = await AankoopfactuurService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.body = updatedAankoopfactuur;
};

updateAankoopfactuur.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    factuurnummer: Joi.string().required(),
    factuurdatum: Joi.date().required(),
    vervaldatum: Joi.date().min(Joi.ref('factuurdatum')).required(),
    omschrijving: Joi.string().required(),
    status: Joi.boolean().required(),
    leverancier_id: Joi.number().integer().positive().required(),
  },
};

/**
 * @swagger
 * /aankoopfacturen/{id}:
 *   delete:
 *     summary: Verwijder een aankoopfactuur
 *     tags:
 *       - Aankoopfacturen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de factuur
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       204:
 *         description: Factuur succesvol verwijderd
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const deleteAankoopfactuur = async (ctx: KoaContext<void, IdParams>) => {
  await AankoopfactuurService.deleteById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.status = 204;
};

deleteAankoopfactuur.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /aankoopfacturen/{id}/aankopen:
 *   get:
 *     summary: Haal alle aankopen van een factuur op
 *     tags:
 *       - Aankoopfacturen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoopfactuur
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Lijst van aankopen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Aankoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllAankopenByFactuurId = async (ctx: KoaContext<GetAllAankopenResponse, IdParams>) => {
  const aankopen = await AankoopService.getAllAankopenByFactuurId(
    ctx.params.id,
    ctx.state.session.gebruikerId,
    ctx.state.session.rollen,
  );
  ctx.body = {
    items: aankopen,
  };
};

getAllAankopenByFactuurId.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/aankoopfacturen',
  });

  router.use(requireAuthentication);

  router.get(
    '/',
    validate(getAllAankoopfacturen.validationScheme),
    getAllAankoopfacturen,
  );

  router.get(
    '/:id',
    validate(getAankoopfactuurById.validationScheme),
    getAankoopfactuurById,
  );
  
  router.post(
    '/',
    validate(createAankoopfactuur.validationScheme),
    createAankoopfactuur,
  );

  router.put(
    '/:id',
    validate(updateAankoopfactuur.validationScheme),
    updateAankoopfactuur,
  );

  router.delete(
    '/:id',
    validate(deleteAankoopfactuur.validationScheme),
    deleteAankoopfactuur,
  );

  router.get(
    '/:id/aankopen',
    validate(getAllAankopenByFactuurId.validationScheme),
    getAllAankopenByFactuurId,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
