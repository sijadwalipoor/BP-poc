import type Decimal from 'decimal.js';
import type { Entity, ListResponse } from './common';
import type { BtwRegime } from './btwRegime';
import type { Verkoopfactuur } from './verkoopfactuur';

export interface Verkoop extends Entity {
  verkoopfactuur: Pick<Verkoopfactuur, 'id'>,
  omschrijving: string,
  bedrag : Decimal,
  btw_regime : Pick<BtwRegime, 'id' | 'omschrijving' | 'btw_percentage'>,
}

export interface VerkoopCreateInput {
  factuur_id: number,
  omschrijving: string,
  bedrag : Decimal,
  btw_regime_id: number,
  gebruiker_id: number,
}

export interface VerkoopUpdateInput extends VerkoopCreateInput {}

// REST-LAAG
export interface CreateVerkoopRequest extends VerkoopCreateInput {}
export interface UpdateVerkoopRequest extends VerkoopUpdateInput {}

export interface GetAllVerkopenResponse extends ListResponse<Verkoop> {}
export interface GetVerkoopByIdResponse extends Verkoop {}
export interface CreateVerkoopResponse extends GetVerkoopByIdResponse {}
export interface UpdateVerkoopResponse extends GetVerkoopByIdResponse {}