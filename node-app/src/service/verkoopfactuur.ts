import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Verkoopfactuur, VerkoopfactuurCreateInput, VerkoopfactuurUpdateInput } from '../types/verkoopfactuur';
import handleDBError from './_handleDBError';
import Role from '../core/roles';

const GEBRUIKER_SELECT = {
  id: true,
};

const KLANT_SELECT = {
  id: true,
  btw_nummer: true,
  bedrijfsnaam: true,
  voornaam: true,
  achternaam: true,
  telefoonnummer: true,
  email: true,
  adres: true,
};

const VERKOOPFACTUUR_SELECT = {
  id: true, 
  factuurnummer : true,
  factuurdatum : true,
  vervaldatum : true,
  omschrijving : true,
  status : true,
  klant: {
    select: KLANT_SELECT,
  },
  gebruiker: {
    select: GEBRUIKER_SELECT,
  },
};

export const getAll = async (gebruikerId : number, rollen : string[]): Promise<Verkoopfactuur[]> => {
  return prisma.verkoopfactuur.findMany({
    where:  rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId },
    select : VERKOOPFACTUUR_SELECT,
  });
};

export const getById = async (id: number, gebruikerId : number, rollen : string[]): Promise<Verkoopfactuur> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };

  const leverancier = await prisma.verkoopfactuur.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: VERKOOPFACTUUR_SELECT,
  });

  if (!leverancier) throw ServiceError.notFound(`Verkoopfactuur met id ${id} bestaat niet!`);

  return leverancier;
};

export const create = async ({gebruiker_id, ...verkoop}: VerkoopfactuurCreateInput): Promise<Verkoopfactuur> => {
  try {
    const { klant_id, ...verkoopfactuurData } = verkoop;

    return await prisma.verkoopfactuur.create({
      data: {
        ...verkoopfactuurData,
        klant: {
          connect: {
            id: klant_id,
          },
        },
        gebruiker: {
          connect: {
            id: gebruiker_id,
          },
        },
      },
      select: VERKOOPFACTUUR_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};

export const updateById = 
  async (id: number, {gebruiker_id, ...verkoop}: VerkoopfactuurUpdateInput): Promise<Verkoopfactuur> => {
    try {
      const { klant_id, ...verkoopData } = verkoop;

      return await prisma.verkoopfactuur.update({
        where: {
          id,
          gebruiker_id,
        },
        data: {
          ...verkoopData,
          klant: {
            connect: {
              id: klant_id,
            },
          },
          gebruiker: {
            connect: {
              id: gebruiker_id,
            },
          },
        },
        select: VERKOOPFACTUUR_SELECT,
      });
    } catch (error: any) {
      throw handleDBError(error);
    }
  };

export const deleteById = async (id: number, gebruikerId : number, rollen : string[]) : Promise<void> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };
  try {
    await prisma.verkoopfactuur.delete({
      where: {
        id,
        ...extraFilter,
      },
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};

export const getAllByKlantId = async (klant_id: number, gebruikerId : number, rollen : string[]): 
Promise<Verkoopfactuur[]> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };
  try {
    return prisma.verkoopfactuur.findMany({
      where: {
        klant_id,
        ...extraFilter,
      },
      select : VERKOOPFACTUUR_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};  
