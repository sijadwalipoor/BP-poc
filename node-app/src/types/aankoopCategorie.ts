import type { Entity, ListResponse } from './common';

export interface AankoopCategorie extends Entity {
  hoofd_categorie : string;
  sub_categorie : string;
}

// REST-LAAG
export interface GetAllAankoopCategorienResponse extends ListResponse<AankoopCategorie> {}
export interface GetAankoopCategorieByIdResponse extends AankoopCategorie {}
