import type { Adres } from './adres';
import type { Gebruiker } from './gebruiker';
import type { Entity, ListResponse } from './common';

export interface Leverancier extends Entity {
  btw_nummer : string;
  bedrijfsnaam : string;
  telefoonnummer : string | null;
  email : string | null;
  adres: Pick<Adres, 'id' | 'land' | 'straat' | 'nr' | 'stadsnaam' | 'postcode'>; 
  gebruiker : Pick<Gebruiker, 'id'>;
}

export interface LeverancierCreateInput {
  btw_nummer : string;
  bedrijfsnaam : string;
  telefoonnummer : string | null;
  email : string | null;
  adres: Pick<Adres, 'id' | 'land' | 'straat' | 'nr' | 'stadsnaam' | 'postcode'>; 
  gebruiker_id: number; 
}

export interface LeverancierUpdateInput extends LeverancierCreateInput {}

// REST-LAAG
export interface CreateLeverancierRequest extends LeverancierCreateInput {}
export interface UpdateLeverancierRequest extends LeverancierUpdateInput {}

export interface GetAllLeveranciersResponse extends ListResponse<Leverancier> {}
export interface GetLeverancierByIdResponse extends Leverancier {}
export interface CreateLeverancierResponse extends GetLeverancierByIdResponse {}
export interface UpdateLeverancierResponse extends GetLeverancierByIdResponse {}