import Router from '@koa/router';
import * as verkoopService from '../service/verkoop';
import type { BoekhoudAppContext, BoekhoudAppState, KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateVerkoopRequest,
  UpdateVerkoopRequest,
  GetAllVerkopenResponse,
  GetVerkoopByIdResponse,
  CreateVerkoopResponse,
  UpdateVerkoopResponse,
} from '../types/verkoop';
import type { IdParams } from '../types/common';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @swagger
 * tags:
 *   name: Verkopen
 *   description: Beheer verkopen in de administratie.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Verkoop:
 *       type: object
 *       required:
 *         - id
 *         - factuur_id
 *         - omschrijving
 *         - bedrag
 *         - btw_regime_id
 *       properties:
 *         id:
 *           type: integer
 *         factuur_id:
 *           type: integer
 *         omschrijving:
 *           type: string
 *         bedrag:
 *           type: number
 *           format: float
 *         btw_regime_id:
 *           type: integer
 *       example:
 *         id: 1
 *         factuur_id: 101
 *         omschrijving: "Product A"
 *         bedrag: 500.00
 *         btw_regime_id: 1
 *     VerkopenList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Verkoop"
 */

/**
 * @swagger
 * /verkopen:
 *   get:
 *     summary: Haal alle verkopen op
 *     tags:
 *       - Verkopen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: by_btw_regime
 *         description: Filter op btw regime
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lijst van verkopen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VerkopenList"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllVerkopen = async (ctx: KoaContext<GetAllVerkopenResponse>) => {
  const { by_btw_regime } = ctx.query;
  
  const verkopen = by_btw_regime 
    ? await verkoopService.getAllByBtwRegime(by_btw_regime, ctx.state.session.gebruikerId)
    : await verkoopService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  
  ctx.body = {
    items: verkopen,
  };
};

getAllVerkopen.validationScheme = null;

/**
 * @swagger
 * /verkopen/{id}:
 *   get:
 *     summary: Haal een specifieke verkoop op
 *     tags:
 *       - Verkopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de verkoop
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Gegevens van de verkoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Verkoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getVerkoopById = async (ctx: KoaContext<GetVerkoopByIdResponse, IdParams>) => {
  const verkoop = await verkoopService.getById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = verkoop;
};

getVerkoopById.validationScheme = {
  params: {
    id: Joi.number(),
  },
};

/**
 * @swagger
 * /verkopen:
 *   post:
 *     summary: Maak een nieuwe verkoop aan
 *     tags:
 *       - Verkopen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Verkoop"
 *     responses:
 *       201:
 *         description: De aangemaakte verkoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Verkoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const createVerkoop = async (ctx: KoaContext<CreateVerkoopResponse, void, CreateVerkoopRequest>) => {
  const newVerkoop = await verkoopService.create({
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.status = 201;
  ctx.body = newVerkoop;
};

createVerkoop.validationScheme = {
  body: {
    factuur_id: Joi.number().positive(),
    omschrijving: Joi.string(),
    bedrag: Joi.number().positive(),
    btw_regime_id: Joi.number().positive(),
  },
};

/**
 * @swagger
 * /verkopen/{id}:
 *   put:
 *     summary: Werk een bestaande verkoop bij
 *     tags:
 *       - Verkopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de verkoop
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Verkoop"
 *     responses:
 *       200:
 *         description: De bijgewerkte verkoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Verkoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const updateVerkoop = async (ctx: KoaContext<UpdateVerkoopResponse, IdParams, UpdateVerkoopRequest>) => {
  const updatedVerkoop = await verkoopService.updateById(ctx.params.id, {
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.body = updatedVerkoop;
};

updateVerkoop.validationScheme = {
  params: {
    id: Joi.number(),
  },
  body: {
    factuur_id: Joi.number().positive(),
    omschrijving: Joi.string(),
    bedrag: Joi.number().positive(),
    btw_regime_id: Joi.number().positive(),
  },
};

/**
 * @swagger
 * /verkopen/{id}:
 *   delete:
 *     summary: Verwijder een verkoop
 *     tags:
 *       - Verkopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de verkoop
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       204:
 *         description: Verkoop succesvol verwijderd
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const deleteVerkoop = async (ctx: KoaContext<void, IdParams>) => {
  await verkoopService.deleteById(ctx.params.id, ctx.state.session.gebruikerId);
  ctx.status = 204;
};

deleteVerkoop.validationScheme = {
  params: {
    id: Joi.number(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/verkopen',
  });

  router.use(requireAuthentication);

  router.get('/', 
    validate(getAllVerkopen.validationScheme), 
    getAllVerkopen,
  );
  router.post(
    '/', 
    validate(createVerkoop.validationScheme), 
    createVerkoop,
  );
  router.get('/:id', 
    validate(getVerkoopById.validationScheme), 
    getVerkoopById,
  );

  router.put(
    '/:id', 
    validate(updateVerkoop.validationScheme), 
    updateVerkoop,
  );
  
  router.delete(
    '/:id', 
    validate(deleteVerkoop.validationScheme), 
    deleteVerkoop,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
