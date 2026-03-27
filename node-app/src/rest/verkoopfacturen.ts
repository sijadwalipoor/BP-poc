import Router from '@koa/router';
import type { BoekhoudAppContext, BoekhoudAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  CreateVerkoopfactuurRequest, 
  UpdateVerkoopfactuurRequest,
  GetAllVerkoopfacturenResponse,
  GetVerkoopfactuurByIdResponse,
  CreateVerkoopfactuurResponse,
  UpdateVerkoopfactuurResponse,
} from '../types/verkoopfactuur';
import type { IdParams } from '../types/common';
import * as VerkoopfactuurService from '../service/verkoopfactuur';
import * as VerkoopService from '../service/verkoop';
import type { GetAllVerkopenResponse } from '../types/verkoop';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

// ---------------------------- getAllVerkoopfacturen 👇 ----------------------------
const getAllVerkoopfacturen = async (ctx: KoaContext<GetAllVerkoopfacturenResponse>) => {
  const aankopen = await VerkoopfactuurService.getAll(ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = {
    items: aankopen,
  };
};

getAllVerkoopfacturen.validationScheme = null;
// --------------------------------------------------------------------------------

// ---------------------------- getVerkoopfactuurById 👇 ---------------------------
const getVerkoopfactuurById = async (ctx: KoaContext<GetVerkoopfactuurByIdResponse, IdParams>) => {
  const Verkoopfactuur = 
    await VerkoopfactuurService.getById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.body = Verkoopfactuur;
};

getVerkoopfactuurById.validationScheme = {
  params: {
    id: Joi.number(),
  },
};
// --------------------------------------------------------------------------------

// ---------------------------- createVerkoopfactuur 👇 ---------------------------
const createVerkoopfactuur = 
    async (ctx: KoaContext<CreateVerkoopfactuurResponse, void, CreateVerkoopfactuurRequest>) => {
      const newVerkoopfactuur = await VerkoopfactuurService.create({
        ...ctx.request.body,
        gebruiker_id: ctx.state.session.gebruikerId,
      });
      ctx.status = 201;
      ctx.body = newVerkoopfactuur;
    };

createVerkoopfactuur.validationScheme = {
  body: {
    factuurnummer: Joi.string(),
    factuurdatum: Joi.date(),
    vervaldatum: Joi.date().min(Joi.ref('factuurdatum')), // vervaldatum moet na factuurdatum zijn
    omschrijving: Joi.string(),
    status: Joi.boolean(),
    klant_id: Joi.number().integer().positive(),
  },
};
// --------------------------------------------------------------------------------

// ---------------------------- updateVerkoopfactuur 👇 ---------------------------
const updateVerkoopfactuur = 
    async (ctx: KoaContext<UpdateVerkoopfactuurResponse, IdParams, UpdateVerkoopfactuurRequest>) => {
      const updatedVerkoopfactuur = await VerkoopfactuurService.updateById(Number(ctx.params.id), {
        ...ctx.request.body,
        gebruiker_id: ctx.state.session.gebruikerId,
      });
      ctx.body = updatedVerkoopfactuur;
    };

updateVerkoopfactuur.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    factuurnummer: Joi.string(),
    factuurdatum: Joi.date(),
    vervaldatum: Joi.date().min(Joi.ref('factuurdatum')), // vervaldatum moet na factuurdatum zijn
    omschrijving: Joi.string(),
    status: Joi.boolean(),
    klant_id: Joi.number().integer().positive(),
  },
};
// --------------------------------------------------------------------------------

// ---------------------------- deleteVerkoopfactuur 👇 ---------------------------
const deleteVerkoopfactuur = async (ctx: KoaContext<void, IdParams>) => {
  await VerkoopfactuurService.deleteById(ctx.params.id, ctx.state.session.gebruikerId, ctx.state.session.rollen);
  ctx.status = 204;
};

deleteVerkoopfactuur.validationScheme = {
  params: {
    id: Joi.number(),
  },
};
// --------------------------------------------------------------------------------

// ---------------------------- getAllVerkopenByFactuurId 👇 ---------------------------
const getAllVerkopenByFactuurId = async (ctx: KoaContext<GetAllVerkopenResponse, IdParams>) => {
  const verkopen = await VerkoopService.getAllVerkopenByFactuurId(ctx.params.id, ctx.state.session.gebruikerId);
  ctx.body = {
    items: verkopen,
  };
};

getAllVerkopenByFactuurId.validationScheme = {
  params: {
    id: Joi.number(),
  },
};
// --------------------------------------------------------------------------------

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/verkoopfacturen',
  });

  router.use(requireAuthentication);

  router.get(
    '/', 
    validate(getAllVerkoopfacturen.validationScheme),
    getAllVerkoopfacturen,
  );
  router.post(
    '/', 
    validate(createVerkoopfactuur.validationScheme),
    createVerkoopfactuur,
  );
  
  router.get(
    '/:id', 
    validate(getVerkoopfactuurById.validationScheme),
    getVerkoopfactuurById,
  );
  router.put(
    '/:id', 
    validate(updateVerkoopfactuur.validationScheme),
    updateVerkoopfactuur,
  );
  router.delete(
    '/:id', 
    validate(deleteVerkoopfactuur.validationScheme),
    deleteVerkoopfactuur,
  );
  router.get(
    '/:id/verkopen', 
    validate(getAllVerkopenByFactuurId.validationScheme),  
    getAllVerkopenByFactuurId,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
