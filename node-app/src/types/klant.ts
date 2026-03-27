import type { Entity, ListResponse } from './common';
import type { Adres } from './adres';
import type { Gebruiker } from './gebruiker';

export interface Klant extends Entity {
  btw_nummer : string;
  bedrijfsnaam : string;
  voornaam : string | null;
  achternaam : string | null;
  telefoonnummer : string | null;
  email : string | null;
  adres : Pick<Adres, 'id' |'land' | 'straat' | 'nr' | 'stadsnaam' | 'postcode'>;
  gebruiker : Pick<Gebruiker, 'id'> 
}

export interface KlantCreateInput {
  btw_nummer : string;
  bedrijfsnaam : string;
  voornaam : string | null;
  achternaam : string | null;
  telefoonnummer : string | null;
  email : string | null;
  adres : Pick<Adres, 'id' | 'land' |'straat' | 'nr' | 'stadsnaam' | 'postcode'>;
  gebruiker_id: number;
  rollen: string[]; 
}

export interface KlantUpdateInput extends KlantCreateInput {}

// REST-LAAG
export interface CreateKlantRequest extends Omit<KlantUpdateInput, 'gebruiker_id' > {}
export interface UpdateKlantRequest extends Omit<KlantUpdateInput, 'gebruiker_id' | 'rollen' >{}

export interface GetAllKlantenResponse extends ListResponse<Klant> {}
export interface GetKlantByIdResponse extends Klant {}
export interface CreateKlantResponse extends GetKlantByIdResponse {}
export interface UpdateKlantResponse extends GetKlantByIdResponse {};