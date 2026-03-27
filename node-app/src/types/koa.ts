// src/types/koa.ts
import type { ParameterizedContext } from 'koa';
import type Application from 'koa';
import type Router from '@koa/router';
import type { SessionInfo } from './auth';

export interface BoekhoudAppState {}

export interface BoekhoudAppContext<
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> {
  request: {
    body: RequestBody;
    query: Query;
  };
  params: Params;
}

export type KoaContext<
  ResponseBody = unknown,
  Params = unknown,
  RequestBody = unknown,
  Query = unknown,
> = ParameterizedContext <
  BoekhoudAppState,
  BoekhoudAppContext<Params, RequestBody, Query>,
  ResponseBody
>;

export interface KoaApplication
  extends Application<BoekhoudAppState, BoekhoudAppContext> {}

export interface KoaRouter extends Router<BoekhoudAppState, BoekhoudAppContext> {}

export interface BoekhoudAppState {
  session: SessionInfo;
}
