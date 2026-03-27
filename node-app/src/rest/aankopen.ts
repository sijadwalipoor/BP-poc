import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateAankoopRequest, 
  UpdateAankoopRequest,
  GetAllAankopenResponse,
  GetAankoopByIdResponse,
  CreateAankoopResponse,
  UpdateAankoopResponse,
} from '../types/aankoop';
import type { IdParams } from '../types/common';
import * as aankoopService from '../service/aankoop';
import validate from '../core/validation';
import Joi from 'joi';
import { requireAuthentication } from '../core/auth';
import { getLogger } from '../core/logging';

/**
 * @swagger
 * tags:
 *   name: Aankopen
 *   description: Beheer aankopen in de administratie.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Aankoop:
 *       type: object
 *       required:
 *         - id
 *         - factuur_id
 *         - bedrag
 *         - btw_percentage
 *         - prive_percentage
 *         - aankoop_categorie_id
 *       properties:
 *         id:
 *           type: integer
 *         factuur_id:
 *           type: integer
 *         bedrag:
 *           type: number
 *           format: float
 *         btw_percentage:
 *           type: number
 *           format: float
 *         prive_percentage:
 *           type: number
 *           format: float
 *         aankoop_categorie_id:
 *           type: integer
 *       example:
 *         id: 1
 *         factuur_id: 123
 *         bedrag: 1000.00
 *         btw_percentage: 0.21
 *         prive_percentage: 0.50
 *         aankoop_categorie_id: 2
 *     AankopenList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Aankoop"
 */

/**
 * @swagger
 * /aankopen:
 *   get:
 *     summary: Haal alle aankopen op
 *     tags:
 *       - Aankopen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: by_hoofd_aankoop_categorie
 *         description: Filter op hoofd aankoopcategorie
 *         schema:
 *           type: string
 *       - in: query
 *         name: by_sub_aankoop_categorie
 *         description: Filter op sub aankoopcategorie
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lijst van aankopen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AankopenList"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAllAankopen = async (ctx: KoaContext<GetAllAankopenResponse>) => {
  const { by_hoofd_aankoop_categorie, by_sub_aankoop_categorie } = ctx.query;

  let aankopen;

  if (by_hoofd_aankoop_categorie) {
    aankopen = await aankoopService.getAllByHoofdAankoopCategorie(
      ctx.state.session.gebruikerId,
      ctx.state.session.rollen,
      by_hoofd_aankoop_categorie,
    );
  } else if (by_sub_aankoop_categorie) {
    aankopen = await aankoopService.getAllBySubAankoopCategorie(
      ctx.state.session.gebruikerId,
      ctx.state.session.rollen,
      by_sub_aankoop_categorie,
    );
  } else {
    aankopen = await aankoopService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  }

  ctx.body = {
    items: aankopen || [],
  };
};

getAllAankopen.validationScheme = {
  query: {
    by_hoofd_aankoop_categorie: Joi.string().optional(),
    by_sub_aankoop_categorie: Joi.string().optional(),
  },
};

/**
 * @swagger
 * /aankopen/{id}:
 *   get:
 *     summary: Haal een specifieke aankoop op
 *     tags:
 *       - Aankopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoop
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Gegevens van de aankoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const getAankoopById = async (ctx: KoaContext<GetAankoopByIdResponse, IdParams>) => {
  const aankoop = await aankoopService.getById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = aankoop;
};

getAankoopById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /aankopen:
 *   post:
 *     summary: Maak een nieuwe aankoop aan
 *     tags:
 *       - Aankopen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Aankoop"
 *     responses:
 *       201:
 *         description: De aangemaakte aankoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const createAankoop = async (ctx: KoaContext<CreateAankoopResponse, void, CreateAankoopRequest>) => {
  getLogger().info(ctx.request.body);
  const newAankoop = await aankoopService.create({
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.status = 201;
  ctx.body = newAankoop;
};

createAankoop.validationScheme = {
  body: {
    factuur_id : Joi.number().integer().positive(),
    bedrag: Joi.number().positive(),
    btw_percentage: Joi.number().precision(2).min(0).max(1),
    prive_percentage: Joi.number().precision(2).min(0).max(1),
    aantal_jaren_afschrijven: Joi.number().integer().positive().allow(null),
    aankoop_categorie_id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /aankopen/{id}:
 *   put:
 *     summary: Werk een bestaande aankoop bij
 *     tags:
 *       - Aankopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoop
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Aankoop"
 *     responses:
 *       200:
 *         description: De bijgewerkte aankoop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Aankoop"
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const updateAankoop = async (ctx: KoaContext<UpdateAankoopResponse, IdParams, UpdateAankoopRequest>) => {
  const updatedAankoop = await aankoopService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    gebruiker_id: ctx.state.session.gebruikerId,
  });
  ctx.body = updatedAankoop;
};

updateAankoop.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    factuur_id : Joi.number().integer().positive(),
    bedrag: Joi.number().positive(),
    btw_percentage: Joi.number().precision(2).min(0).max(1),
    prive_percentage: Joi.number().precision(2).min(0).max(1),
    aantal_jaren_afschrijven: Joi.number().integer().positive().allow(null),
    aankoop_categorie_id: Joi.number().integer().positive(),
  },
};

/**
 * @swagger
 * /aankopen/{id}:
 *   delete:
 *     summary: Verwijder een aankoop
 *     tags:
 *       - Aankopen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Het ID van de aankoop
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       204:
 *         description: Aankoop succesvol verwijderd
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       401:
 *         $ref: '#/components/responses/401Unauthorized'
 */
const deleteAankoop = async (ctx: KoaContext<void, IdParams>) => {
  await aankoopService.deleteById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.status = 204;
};

deleteAankoop.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/aankopen',
  });

  router.use(requireAuthentication);

  router.get(
    '/',
    validate(getAllAankopen.validationScheme),
    getAllAankopen,
  );

  router.post(
    '/', 
    validate(createAankoop.validationScheme),
    createAankoop,
  );
  
  router.get(
    '/:id', 
    validate(getAankoopById.validationScheme),
    getAankoopById,
  );

  router.put(
    '/:id', 
    validate(updateAankoop.validationScheme),  
    updateAankoop,
  );

  router.delete(
    '/:id', 
    validate(deleteAankoop.validationScheme),  
    deleteAankoop,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
