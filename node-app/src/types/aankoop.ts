import type Decimal from 'decimal.js';
import type { Entity, ListResponse } from './common';
import type { Aankoopfactuur } from './aankoopfactuur';
import type { AankoopCategorie } from '@prisma/client';

export interface Aankoop extends Entity {
  aankoopfactuur : Pick<Aankoopfactuur, 'id' >;
  bedrag : Decimal;
  btw_percentage : Decimal;
  prive_percentage : Decimal;
  aankoop_categorie: Pick<AankoopCategorie, 'id' | 'hoofd_categorie' | 'sub_categorie'>;
}

export interface AankoopCreateInput {
  factuur_id: number;
  bedrag : Decimal;
  btw_percentage : Decimal;
  prive_percentage : Decimal;
  aankoop_categorie_id: number;
  gebruiker_id: number;
}
      
export interface AankoopUpdateInput extends AankoopCreateInput {}

// REST-LAAG
export interface CreateAankoopRequest extends AankoopCreateInput {}
export interface UpdateAankoopRequest extends AankoopUpdateInput {}

export interface GetAllAankopenResponse extends ListResponse<Aankoop> {}
export interface GetAankoopByIdResponse extends Aankoop {}
export interface CreateAankoopResponse extends GetAankoopByIdResponse {}
export interface UpdateAankoopResponse extends GetAankoopByIdResponse {}