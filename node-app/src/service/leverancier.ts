import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Leverancier, LeverancierCreateInput, LeverancierUpdateInput } from '../types/leverancier';
import Role from '../core/roles';
import handleDBError from './_handleDBError';

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
  gebruiker: {
    select: {
      id: true,
    },
  },
};

export const getAll = async (gebruikerId : number, rollen : string[]): Promise<Leverancier[]> => {
  return prisma.leverancier.findMany({
    where:  rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId },
    select: LEVERANCIER_SELECT,
    
  });
};

export const getById = async (id: number, gebruikerId : number, rollen : string[]): Promise<Leverancier> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };
  const leverancier = await prisma.leverancier.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: LEVERANCIER_SELECT,
  });

  if (!leverancier) {
    throw ServiceError.notFound(`Leverancier met id ${id} bestaat niet!`);
  }

  return leverancier;
};

export const create = async ({gebruiker_id ,...leverancier}: LeverancierCreateInput): Promise<Leverancier> => {
  try {
    const { adres, ...leverancierData } = leverancier;
  
    return await prisma.leverancier.create({
      data: {
        ...leverancierData,
        adres: {
          create: {
            ...adres,
          },
        },
        gebruiker: {
          connect: {
            id: gebruiker_id, 
          },
        },
      },
      select: LEVERANCIER_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }

};

export const updateById = 
  async (id: number, {gebruiker_id, ...leverancier}: LeverancierUpdateInput): Promise<Leverancier> => {
    try {
      const { adres, ...leverancierData } = leverancier;
    
      return prisma.leverancier.update({
        where: {
          id,
          gebruiker_id,
        },
        data: {
          ...leverancierData,
          adres: {
            update: adres,
          },
        },
        select: LEVERANCIER_SELECT,
      });
    } catch (error : any) {
      throw handleDBError(error);
    }
  };

export const deleteById = async (id: number, gebruikerId : number) => {
  try {
    await prisma.leverancier.delete({
      where: {
        id,
        gebruiker_id: gebruikerId,
      },
    });
  
    return { message: `Supplier with ID ${id} has been deleted` };
  } catch (error : any) {
    throw handleDBError(error);
  }
};
