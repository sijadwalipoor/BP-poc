import type { Entity } from './common';

export interface Adres extends Entity {
  land: string;
  straat : string,
  nr : number,
  stadsnaam : string,
  postcode : string,
}