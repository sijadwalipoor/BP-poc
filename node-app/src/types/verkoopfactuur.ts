import type { Gebruiker } from './gebruiker';
import type { Entity, ListResponse } from './common';
import type { Klant } from './klant';

export interface Verkoopfactuur extends Entity {
  factuurnummer : string,
  factuurdatum : Date,
  vervaldatum : Date,
  omschrijving : string,
  status : boolean,

  klant : Pick<Klant, 'id' |'btw_nummer' |'bedrijfsnaam' | 'voornaam' 
  | 'achternaam' | 'telefoonnummer' | 'email'  | 'adres' >,
  gebruiker : Pick<Gebruiker, 'id'>,
}

export interface VerkoopfactuurCreateInput {
  factuurnummer : string,
  factuurdatum : Date,
  vervaldatum : Date,
  omschrijving : string,
  status : boolean,
  
  klant_id : number,
  gebruiker_id : number,
}

export interface VerkoopfactuurUpdateInput extends VerkoopfactuurCreateInput {}

// REST-LAAG
export interface CreateVerkoopfactuurRequest extends VerkoopfactuurCreateInput {}
export interface UpdateVerkoopfactuurRequest extends VerkoopfactuurUpdateInput {}

export interface GetAllVerkoopfacturenResponse extends ListResponse<Verkoopfactuur> {}
export interface GetVerkoopfactuurByIdResponse extends Verkoopfactuur {}
export interface CreateVerkoopfactuurResponse extends GetVerkoopfactuurByIdResponse {}
export interface UpdateVerkoopfactuurResponse extends GetVerkoopfactuurByIdResponse {}