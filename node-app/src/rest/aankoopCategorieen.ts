import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type { GetAllAankoopCategorienResponse, GetAankoopCategorieByIdResponse } from '../types/aankoopCategorie';
import type { IdParams } from '../types/common';

import * as AankoopCategorieService from '../service/aankoopCategorie';
import Joi from 'joi';
import validate from '../core/validation';
/**
 * @swagger
 * tags:
 *   name: AankoopCategorieën
 *   description: De categorieën waarin aankopen kunnen worden ingedeeld
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Aankoopcategorie:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - id
 *             - hoofd_categorie
 *             - sub_categorie
 *           properties:
 *             hoofd_categorie:
 *               type: "string"
 *             sub_categorie:
 *               type: "string"
 *           example:
 *             id: 123
 *             hoofd_categorie: "Handelsgoederen en grond- en hulpstoffen"
 *             sub_categorie: "Handelsgoederen"
 *     AankoopcategorieënList:
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Aankoopcategorie"
 */

/**
 * @swagger
 * /api/aankoopcategorieen:
 *   get:
 *     summary: Lijst van alle aankoopcategorieën
 *     tags:
 *       - AankoopCategorieën
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lijst van alle aankoopcategorieën
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AankoopcategorieënList"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllAankoopCategorieen = async (ctx: KoaContext<GetAllAankoopCategorienResponse>) => {
  const aankoopCategorieen = await AankoopCategorieService.getAll();
  ctx.body = {
    items: aankoopCategorieen,
  };
};

getAllAankoopCategorieen.validationScheme = null;

/**
 * @swagger
 * /api/aankoopcategorieen/{id}:
 *   get:
 *     summary: Haal een specifieke aankoopcategorie op via ID
 *     tags:
 *       - AankoopCategorieën
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoopcategorie
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Gegevens van de aankoopcategorie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoopcategorie"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAankoopCategorieenById = async (ctx: KoaContext<GetAankoopCategorieByIdResponse, IdParams>) => {
  const aankoopCategorie = await AankoopCategorieService.getById(Number(ctx.params.id));
  ctx.body = aankoopCategorie;
};

getAankoopCategorieenById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

// ------ROUTER------
export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/aankoop-categorieen',
  });

  // Geen authenticatie of autorisatie nodig voor deze routes:
  router.get(
    '/',
    validate(getAllAankoopCategorieen.validationScheme),
    getAllAankoopCategorieen,
  );
  router.get(
    '/:id', 
    validate(getAankoopCategorieenById.validationScheme),
    getAankoopCategorieenById,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
