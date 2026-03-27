import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { AankoopCategorie } from '../types/aankoopCategorie';

const AANKOOP_CATEGORIE_SELECT = {
  id: true,
  hoofd_categorie: true,
  sub_categorie: true,
};

export const getAll = async (): Promise<AankoopCategorie[]> => {
  return prisma.aankoopCategorie.findMany({
    select : AANKOOP_CATEGORIE_SELECT,
  });
};

export const getById = async (id: number): Promise<AankoopCategorie> => {
  const aankoopCategorie = await prisma.aankoopCategorie.findUnique({
    where: {
      id,
    },
    select: AANKOOP_CATEGORIE_SELECT,
  });

  if (!aankoopCategorie) throw ServiceError.notFound(`Aankoopcategorie met id ${id} bestaat niet!`);

  return aankoopCategorie;
};
