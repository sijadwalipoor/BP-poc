import type { Prisma } from '@prisma/client';
import type { Adres } from './adres';
import type { Entity, ListResponse } from './common';

// SERVICE-LAAG
export interface Gebruiker extends Entity {
  btw_nummer : string;
  bedrijfsnaam : string;
  voornaam : string;
  achternaam : string;
  telefoonnummer : string;
  email : string;
  wachtwoord_hash : string;
  rollen : Prisma.JsonValue;
  adres : Pick<Adres, 'id' | 'land' |'straat' | 'nr' | 'stadsnaam' | 'postcode'>;
}

export interface GebruikerCreateInput {
  gebruiker_id: number;
  btw_nummer : string;
  bedrijfsnaam : string;
  voornaam : string;
  achternaam : string;
  telefoonnummer : string;
  email : string;
  wachtwoord: string;
  adres : Pick<Adres, 'id' |'land' | 'straat' | 'nr' | 'stadsnaam' | 'postcode'>
}

export interface PublicGebruiker extends Omit<Gebruiker, 'rollen' | 'wachtwoord_hash'> {}
export interface GebruikerUpdateInput extends Omit<GebruikerCreateInput, 'wachtwoord'> {}

// REST-LAAG
export interface CreateGebruikerRequest extends GebruikerCreateInput {}
export interface UpdateGebruikerRequest extends GebruikerUpdateInput {}

export interface GetAllGebruikersResponse extends ListResponse<PublicGebruiker> {}
export interface GetGebruikerByIdResponse extends PublicGebruiker {}
export interface CreateBedrijfResponse extends GetGebruikerByIdResponse {}
export interface UpdateBedrijfResponse extends GetGebruikerByIdResponse {}

export interface RegiserUserRequest extends GebruikerCreateInput {} // Om te registreren heb je alle velden nodig!

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface GetUserRequest {
  id: number | 'me'; 
}