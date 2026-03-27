import type { Entity, ListResponse } from './common';
import type { Gebruiker } from './gebruiker';
import type { Leverancier } from './leverancier';

export interface Aankoopfactuur extends Entity {
  factuurnummer : string,
  factuurdatum : Date,
  vervaldatum : Date,
  omschrijving : string,
  status : boolean,
  leverancier : Pick<Leverancier, 'id' | 'btw_nummer' | 'bedrijfsnaam' | 'telefoonnummer' | 'email' | 'adres'>,
  gebruiker : Pick<Gebruiker, 'id' >,
}

export interface AankoopfactuurCreateInput {
  factuurnummer : string,
  factuurdatum : Date,
  vervaldatum : Date,
  omschrijving : string,
  status : boolean,
  leverancier_id : number,
  gebruiker_id : number, 
}
      
export interface AankoopfactuurUpdateInput extends AankoopfactuurCreateInput {}

// REST-LAAG
export interface CreateAankoopfactuurRequest extends AankoopfactuurCreateInput {}
export interface UpdateAankoopfactuurRequest extends AankoopfactuurUpdateInput {}

export interface GetAllAankoopfacturenResponse extends ListResponse<Aankoopfactuur> {}
export interface GetAankoopfactuurByIdResponse extends Aankoopfactuur {}
export interface CreateAankoopfactuurResponse extends GetAankoopfactuurByIdResponse {}
export interface UpdateAankoopfactuurResponse extends GetAankoopfactuurByIdResponse {}