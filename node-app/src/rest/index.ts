import Router from '@koa/router';
import installAankoopCategorienRouter from './aankoopCategorieen';
import installGebruikerRouter from './gebruikers';
import installSessionRouter from './session';
import installHealthRouter from './health';
import installKlantRouter from './klanten';
import installLeverancierRouter from './leveranciers';
import installVerkoopfactuurRouter from './verkoopfacturen';
import installAankoopfactuurRouter from './aankoopfacturen';
import installAankoopRouter from './aankopen';
import installVerkoopRouter from './verkopen';
import installBtwRegimeRouter from './btwRegimes';

import type { BoekhoudAppContext, BoekhoudAppState, KoaApplication } from '../types/koa';

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           format: "int32"
 *   parameters:
 *     idParam:
 *       in: path
 *       name: id
 *       description: Id of the item to fetch/update/delete
 *       required: true
 *       schema:
 *         type: integer
 *         format: "int32"
 *   securitySchemes:
 *     bearerAuth: # arbitrary name for the security scheme
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT # optional, arbitrary value for documentation purposes
 *   responses:
 *     400BadRequest:
 *       description: You provided invalid data
 *     401Unauthorized:
 *       description: You need to be authenticated to access this resource
 *     403Forbidden:
 *       description: You don't have access to this resource
 *     404NotFound:
 *       description: The requested resource could not be found
 */
export default (app: KoaApplication) => {
  const router = new Router<BoekhoudAppState, BoekhoudAppContext>({
    prefix: '/api',
  });

  installBtwRegimeRouter(router);

  installAankoopfactuurRouter(router);
  installLeverancierRouter(router);

  installVerkoopfactuurRouter(router);
  installKlantRouter(router);

  installVerkoopRouter(router);
  installAankoopRouter(router);

  installAankoopCategorienRouter(router); 
  installGebruikerRouter(router);
  installHealthRouter(router);
  
  installSessionRouter(router); // inlog route

  app.use(router.routes()).use(router.allowedMethods());
};
