import type Decimal from 'decimal.js';
import type { Entity, ListResponse } from './common';

export interface BtwRegime extends Entity {
  btw_percentage: Decimal;
  omschrijving: string;
}

// REST-LAAG
export interface GetAllBtwRegimesResponse extends ListResponse<BtwRegime> {}
export interface GetBtwRegimeByIdResponse extends BtwRegime {}