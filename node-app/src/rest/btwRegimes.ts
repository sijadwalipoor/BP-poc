import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type { GetAllBtwRegimesResponse, GetBtwRegimeByIdResponse } from '../types/btwRegime';
import type { IdParams } from '../types/common';

import * as BtwRegimesService from '../service/btwRegime';
import Joi from 'joi';
import validate from '../core/validation';

/**
 * @swagger
 * tags:
 *   name: BTW Regimes
 *   description: Beheer van BTW-regimes.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BtwRegime:
 *       type: object
 *       required:
 *         - id
 *         - omschrijving
 *         - btw_percentage
 *       properties:
 *         id:
 *           type: integer
 *         omschrijving:
 *           type: string
 *         btw_percentage:
 *           type: number
 *           format: float
 *       example:
 *         id: 1
 *         omschrijving: "Verlaagd tarief"
 *         btw_percentage: 0.06
 *     BtwRegimesList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/BtwRegime"
 */

/**
 * @swagger
 * /btw-regimes:
 *   get:
 *     summary: Haal alle BTW-regimes op
 *     tags:
 *       - BTW Regimes
 *     responses:
 *       200:
 *         description: Lijst van BTW-regimes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BtwRegimesList"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllBtwRegimes = async (ctx: KoaContext<GetAllBtwRegimesResponse>) => {
  const btwRegimes = await BtwRegimesService.getAll();
  ctx.body = {
    items: btwRegimes,
  };
};
getAllBtwRegimes.validationScheme = null;

/**
 * @swagger
 * /btw-regimes/{id}:
 *   get:
 *     summary: Haal een specifiek BTW-regime op
 *     tags:
 *       - BTW Regimes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van het BTW-regime
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Gegevens van het specifieke BTW-regime
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BtwRegime"
 *       404:
 *         description: Het opgegeven BTW-regime bestaat niet.
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getBtwRegimeById = async (ctx: KoaContext<GetBtwRegimeByIdResponse, IdParams>) => {
  const btwRegimes = await BtwRegimesService.getById(Number(ctx.params.id));
  ctx.body = btwRegimes;
};
getBtwRegimeById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/btw-regimes',
  });

  router.get(
    '/', 
    validate(getAllBtwRegimes.validationScheme),
    getAllBtwRegimes,
  );
  
  router.get(
    '/:id', 
    validate(getBtwRegimeById.validationScheme),  
    getBtwRegimeById,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
