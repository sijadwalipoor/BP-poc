import Router from '@koa/router';
import * as healthService from '../service/health';
import type { Context } from 'koa';
import type { BoekhoudAppContext, BoekhoudAppState, KoaRouter } from '../types/koa';
import validate from '../core/validation';

// ---------------------------- Ping 👇 ----------------------------
const ping = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = healthService.ping();
};

ping.validationScheme = null;
// ----------------------------------------------------------------

// ---------------------------- getVersion 👇 ---------------------
const getVersion = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = healthService.getVersion();
};

getVersion.validationScheme = null;
// ----------------------------------------------------------------

export default (parent: KoaRouter) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({ prefix: '/health' });

  // Geen authenticatie of autorisatie nodig voor deze routes
  router.get(
    '/ping', 
    validate(ping.validationScheme),
    ping,
  );

  router.get(
    '/version', 
    validate(getVersion.validationScheme),
    getVersion,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
