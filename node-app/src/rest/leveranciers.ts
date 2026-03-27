import Router from '@koa/router';
import * as leverancierService from '../service/leverancier';
import * as AankoopfactuurService from '../service/aankoopfactuur';

import type { BoekhoudAppContext, BoekhoudAppState, KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateLeverancierRequest,
  UpdateLeverancierRequest,
  GetAllLeveranciersResponse,
  GetLeverancierByIdResponse,
  CreateLeverancierResponse,
  UpdateLeverancierResponse,
} from '../types/leverancier';
import type { IdParams } from '../types/common';
import type { GetAllAankoopfacturenResponse } from '../types/aankoopfactuur';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @swagger
 * /leveranciers:
 *   get:
 *     summary: Get all leveranciers
 *     description: Returns a list of all leveranciers
 *     responses:
 *       200:
 *         description: List of leveranciers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leverancier'
 */
const getAllLeveranciers = async (ctx: KoaContext<GetAllLeveranciersResponse>) => {
  const leveranciers = await leverancierService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = {
    items: leveranciers,
  };
};

getAllLeveranciers.validationScheme = null;

/**
 * @swagger
 * /leveranciers:
 *   post:
 *     summary: Create a new leverancier
 *     description: Create a new leverancier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeverancierRequest'
 *     responses:
 *       201:
 *         description: Created leverancier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leverancier'
 */
const createLeverancier = async (ctx: KoaContext<CreateLeverancierResponse, void, CreateLeverancierRequest>) => {
  const newLeverancier = await leverancierService.create({
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.status = 201;
  ctx.body = newLeverancier;
};

createLeverancier.validationScheme = {
  body: {
    btw_nummer: Joi.string(),
    bedrijfsnaam: Joi.string(),
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
 * /leveranciers/{id}:
 *   get:
 *     summary: Get a specific leverancier by ID
 *     description: Get the details of a specific leverancier by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the leverancier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested leverancier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leverancier'
 */
const getLeverancierById = async (ctx: KoaContext<GetLeverancierByIdResponse, IdParams>) => {
  const leverancier = 
    await leverancierService.getById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = leverancier;
};

getLeverancierById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /leveranciers/{id}:
 *   put:
 *     summary: Update an existing leverancier
 *     description: Update the details of an existing leverancier by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the leverancier
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeverancierRequest'
 *     responses:
 *       200:
 *         description: The updated leverancier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leverancier'
 */
const updateLeverancier = async (ctx: KoaContext<UpdateLeverancierResponse, IdParams, UpdateLeverancierRequest>) => {
  const updatedLeverancier = await leverancierService.updateById(ctx.params.id, {
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.body = updatedLeverancier;
};

updateLeverancier.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
  body: {
    btw_nummer: Joi.string(),
    bedrijfsnaam: Joi.string(),
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
 * /leveranciers/{id}:
 *   delete:
 *     summary: Delete a leverancier
 *     description: Deletes a leverancier by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the leverancier
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Successfully deleted
 */
const deleteLeverancier = async (ctx: KoaContext<void, IdParams>) => {
  await leverancierService.deleteById(ctx.params.id, ctx.state.session.gebruikerId);
  ctx.status = 204;
};

deleteLeverancier.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
};

/**
 * @swagger
 * /leveranciers/{id}/aankoopfacturen:
 *   get:
 *     summary: Get all aankoopfacturen for a leverancier
 *     description: Get all aankoopfacturen related to a specific leverancier by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the leverancier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of aankoopfacturen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Aankoopfactuur'
 */
const getAllAankoopfacturenByLeverancierId = 
  async (ctx: KoaContext<GetAllAankoopfacturenResponse, IdParams>) => {
    const aankoopfacturen = 
    await AankoopfactuurService.getAllByLeverancierId(
      ctx.params.id, 
      ctx.state.session.gebruikerId, 
      ctx.state.session.rollen,
    );
    ctx.body = {
      items: aankoopfacturen,
    };
  };

getAllAankoopfacturenByLeverancierId.validationScheme = {
  params: {
    id: Joi.number().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/leveranciers',
  });

  router.use(requireAuthentication);

  router.get(
    '/', 
    validate(getAllLeveranciers.validationScheme),
    getAllLeveranciers,
  );
  router.post(
    '/', 
    validate(createLeverancier.validationScheme),
    createLeverancier,
  );
  router.get(
    '/:id', 
    validate(getLeverancierById.validationScheme),
    getLeverancierById,
  );
  router.put(
    '/:id', 
    validate(updateLeverancier.validationScheme),
    updateLeverancier,
  );
  router.delete(
    '/:id', 
    validate(deleteLeverancier.validationScheme),
    deleteLeverancier,
  );
  router.get(
    '/:id/aankoopfacturen', 
    validate(getAllAankoopfacturenByLeverancierId.validationScheme),
    getAllAankoopfacturenByLeverancierId,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
