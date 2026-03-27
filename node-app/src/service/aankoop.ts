import { prisma } from '../data';
import type { Aankoop, AankoopCreateInput, AankoopUpdateInput } from '../types/aankoop';
import { AANKOOPFACTUUR_ZONDER_AANKOPEN_SELECT as AANKOOPFACTUUR_SELECT } from './aankoopfactuur';
import Role from '../core/roles';

import ServiceError from '../core/serviceError'; 
import handleDBError from './_handleDBError'; 

const AANKOOP_SELECT = {
  id: true, 
  aankoopfactuur: {
    select : AANKOOPFACTUUR_SELECT,
  },
  bedrag: true,
  btw_percentage: true,
  prive_percentage: true,
  aantal_jaren_afschrijven: true,
  aankoop_categorie: true,
};

export const getAll = async (gebruikerId: number, rollen: string[]): Promise<Aankoop[]> => {
  return prisma.aankoop.findMany({
    where: {
      ...(rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId} }),
    },
    select: AANKOOP_SELECT,
  });
};

export const getAllByHoofdAankoopCategorie = async (
  gebruikerId: number,
  rollen: string[],
  hoofd_categorie: string | string[],
): Promise<Aankoop[]> => {
  const whereClause = {
    aankoop_categorie: {
      hoofd_categorie: Array.isArray(hoofd_categorie)
        ? { in: hoofd_categorie }
        : hoofd_categorie,
    },
  };

  return prisma.aankoop.findMany({
    where: {
      ...whereClause,
      ...(rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId} }),
    },
    select: AANKOOP_SELECT,
  });
};

export const getAllBySubAankoopCategorie = async (
  gebruikerId: number,
  rollen: string[],
  sub_categorie: string | string[],
): Promise<Aankoop[]> => {
  const whereClause = {
    aankoop_categorie: {
      sub_categorie: Array.isArray(sub_categorie)
        ? { in: sub_categorie }
        : sub_categorie,
    },
  };

  return prisma.aankoop.findMany({
    where: {
      ...whereClause,
      ...(rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId} }),
    },
    select: AANKOOP_SELECT,
  });
};

export const getById = async (id: number, gebruikerId : number, rollen: string[]): Promise<Aankoop> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId }};

  const aankoop = await prisma.aankoop.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: AANKOOP_SELECT,
  });
  
  if (!aankoop) throw ServiceError.notFound(`Aankoop met id ${id} bestaat niet!`);

  return aankoop;
};

export const create = async ({gebruiker_id ,...aankoop}: AankoopCreateInput): Promise<Aankoop> => {
  try {
    const { aankoop_categorie_id, factuur_id, ...aankoopData } = aankoop;
    // Hier hoef je niet eerst te kijken of de aankoopfactuur en aankoopcategorie bestaan,
    // door de connect te gebruiken, gooit Prisma zelf een 'P20003' error die dan wordt opgevangen
    // in ons handleDBError! 

    return await prisma.aankoop.create({
      data: {
        ...aankoopData,
        aankoop_categorie: {
          connect: { id: aankoop_categorie_id },
        },
        aankoopfactuur: {
          connect: { 
            id: factuur_id,
            gebruiker_id: gebruiker_id,
          },
        },
      },
      select: AANKOOP_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error); 
  }
};

export const updateById = async (id: number, {gebruiker_id, ...aankoop}: AankoopUpdateInput): Promise<Aankoop> => {
  try {
    const { aankoop_categorie_id, factuur_id, ...aankoopData } = aankoop;
    // Hier hoef je niet eerst te kijken of de aankoopfactuur en aankoopcategorie bestaan,
    // door de connect te gebruiken, gooit Prisma zelf een 'P2003' error die dan wordt opgevangen
    // in ons handleDBError! 
    return await prisma.aankoop.update({
      where: {
        id,
      },
      data: {
        ...aankoopData,
        aankoopfactuur: {
          connect: { 
            id: factuur_id,
            gebruiker_id : gebruiker_id,
          },
        }, 
        aankoop_categorie: {
          connect: { id: aankoop_categorie_id },
        },   
      },
      select: AANKOOP_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error); 
  }
  
};

export const deleteById = async (id: number, gebruikerId : number, rollen: string[]) : Promise<void> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId} };
  try {
    await prisma.aankoop.delete({
      where: {
        id,
        ...extraFilter,
      },
    });
  } catch (error: any) {
    throw handleDBError(error); 
  }
};

export const getAllAankopenByFactuurId = 
async (factuur_id: number, gebruikerId : number,  rollen : string[]): Promise<Aankoop[]> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { aankoopfactuur : {gebruiker_id: gebruikerId} };
  try {
    return prisma.aankoop.findMany({
      where: {
        factuur_id,
        ...extraFilter,
      },
      select: AANKOOP_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error); 
  }
};
