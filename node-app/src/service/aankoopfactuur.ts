import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Aankoopfactuur, AankoopfactuurCreateInput, AankoopfactuurUpdateInput } from '../types/aankoopfactuur';
import handleDBError from './_handleDBError';
import Role from '../core/roles';

const GEBRUIKER_SELECT = {
  id: true,
};

const ADRES_SELECT = {
  id: true,
  land: true,
  straat: true,
  nr: true,
  stadsnaam: true,
  postcode: true,
};

const LEVERANCIER_SELECT = {
  id: true,
  btw_nummer: true,
  bedrijfsnaam: true,
  telefoonnummer: true,
  email: true,
  adres: {
    select: ADRES_SELECT,
  },
};
const AANKOPEN_SELECT = {
  id: true,
  bedrag: true,
  btw_percentage: true,
  prive_percentage: true,
  aantal_jaren_afschrijven: true,
  aankoop_categorie: {
    select: {
      id: true,
      hoofd_categorie: true,
      sub_categorie: true,
    },
  },
};

const AANKOOPFACTUUR_MET_AANKOPEN_SELECT = {
  id: true, 
  factuurnummer : true,
  factuurdatum : true,
  vervaldatum : true,
  omschrijving : true,
  status : true,
  leverancier: {
    select: LEVERANCIER_SELECT,
  },
  aankopen: {
    select: AANKOPEN_SELECT,
  },
  gebruiker: {
    select: GEBRUIKER_SELECT,
  },
};

// Deze select wordt geexporteerd en gebruikt in aankoop.ts
export const AANKOOPFACTUUR_ZONDER_AANKOPEN_SELECT = {
  id: true, 
  factuurnummer : true,
  factuurdatum : true,
  vervaldatum : true,
  omschrijving : true,
  status : true,
  leverancier: {
    select: LEVERANCIER_SELECT,
  },
  gebruiker: {
    select: GEBRUIKER_SELECT,
  },
};

export const getAll = async (gebruikerId : number, rollen : string[]): Promise<Aankoopfactuur[]> => {
  return prisma.aankoopfactuur.findMany({
    where:  rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId },
    select : AANKOOPFACTUUR_ZONDER_AANKOPEN_SELECT,
  });
};

export const getById = async (id: number, gebruikerId : number , rollen : string[]): Promise<Aankoopfactuur> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };

  const leverancier = await prisma.aankoopfactuur.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: AANKOOPFACTUUR_ZONDER_AANKOPEN_SELECT,
  });

  if (!leverancier) throw ServiceError.notFound(`Aankoopfactuur met id ${id} bestaat niet!`);

  return leverancier;
};

export const create = async ({gebruiker_id, ...aankoop}: AankoopfactuurCreateInput): Promise<Aankoopfactuur> => {
  try {
    const { leverancier_id, ...aankoopfactuurData } = aankoop;

    return await prisma.aankoopfactuur.create({
      data: {
        ...aankoopfactuurData,
        leverancier: {
          connect: {
            id: leverancier_id,
          },
        },
        gebruiker: {
          connect: {
            id: gebruiker_id,
          },
        },
      },
      select: AANKOOPFACTUUR_MET_AANKOPEN_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const updateById = 
  async (id: number, {gebruiker_id ,...aankoop}: AankoopfactuurUpdateInput): Promise<Aankoopfactuur> => {
    try {
      const { leverancier_id, ...aankoopData } = aankoop;

      return await prisma.aankoopfactuur.update({
        where: {
          id,
          gebruiker_id,
        },
        data: {
          ...aankoopData,
          leverancier: {
            connect: {
              id: leverancier_id,
            },
          },
          gebruiker: {
            connect: {
              id: gebruiker_id, 
            },
          },
        },
        select: AANKOOPFACTUUR_MET_AANKOPEN_SELECT,
      });
    } catch (error : any) {
      throw handleDBError(error);
    }
  };

export const deleteById = async (id: number, gebruikerId : number, rollen:string[]) : Promise<void> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };
  try {
    await prisma.aankoopfactuur.delete({
      where: {
        id,
        ...extraFilter,
      },
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
  
};

export const getAllByLeverancierId = 
  async (leverancier_id: number, gebruikerId : number, rollen : string[]): Promise<Aankoopfactuur[]> => { 
    const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };

    try {
      return prisma.aankoopfactuur.findMany({
        where: {
          leverancier_id,
          ...extraFilter,
        },
        select: AANKOOPFACTUUR_MET_AANKOPEN_SELECT,
      });
    } catch (error : any) {
      throw handleDBError(error);
    }
  };
