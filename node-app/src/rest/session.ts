// src/rest/session.ts
import Router from '@koa/router';
import Joi from 'joi';
import validate from '../core/validation';
import * as userService from '../service/gebruiker';
import type {
  KoaContext,
  KoaRouter,
  BoekhoudAppContext,
  BoekhoudAppState,
} from '../types/koa';
import type { LoginResponse, LoginRequest } from '../types/gebruiker';

// ---------------------------- login 👇 ----------------------------
const login = async (ctx: KoaContext<LoginResponse, void, LoginRequest>) => {
  const { email, password } = ctx.request.body;
  const token = await userService.login(email, password); // 👈 3

  ctx.status = 200;
  ctx.body = { token };
};

login.validationScheme = {
  body: {
    email: Joi.string().email(),
    password: Joi.string(),
  },
};
// ---------------------------------------------------------------------

export default function installSessionRouter(parent: KoaRouter) {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/sessions',
  });

  router.post('/', validate(login.validationScheme), login);

  parent.use(router.routes()).use(router.allowedMethods());
}