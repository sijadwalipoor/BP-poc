import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Klant, KlantCreateInput, KlantUpdateInput } from '../types/klant';
import handleDBError from './_handleDBError';
import Role from '../core/roles';
import * as adresService from './adres';

const ADRES_SELECT = {
  id: true,
  land: true,
  straat: true,
  nr: true,
  stadsnaam: true,
  postcode: true,
};

const KLANT_SELECT = {
  id: true,
  btw_nummer: true,
  bedrijfsnaam: true,
  voornaam: true,
  achternaam: true,
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

export const getAll = async (gebruikerId : number, rollen : string[]): Promise<Klant[]> => {
  return prisma.klant.findMany({
    where:  rollen.includes(Role.ADMIN) ? {} : {gebruiker_id: gebruikerId},
    select: KLANT_SELECT,
  });
};

export const getById = async (id: number, gebruikerId : number, rollen : string[]): Promise<Klant> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };

  const klant = await prisma.klant.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: KLANT_SELECT,
  });
  
  if (!klant) throw ServiceError.notFound(`Klant met id ${id} bestaat niet!`);
  
  return klant;
};

export const create = async ({gebruiker_id,...klant}: KlantCreateInput): Promise<Klant> => {
  try {
    const { adres, ...klantData } = klant;

    return prisma.klant.create({
      data: {
        ...klantData,
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
      select: KLANT_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const updateById = async (id: number, { gebruiker_id, rollen, ...klant }: KlantUpdateInput): Promise<Klant> => {
  try {
    const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id };
    const { adres, ...klantData } = klant;
    await checkIfKlantExists(id);
    await adresService.checkIfAdresExists(adres.id);

    return prisma.klant.update({
      where: { 
        id,  
        ...extraFilter,
      },
      data: {
        ...klantData,
        adres: {
          update: adres, 
        },
      },
      select: KLANT_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number, gebruikerId: number, rollen : string[]): Promise<void> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { gebruiker_id: gebruikerId };
  
  try {
    await prisma.klant.delete({
      where: { 
        id,
        ...extraFilter,
      },
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const checkIfKlantExists = async (id: number): Promise<void> => {
  const klant = await prisma.klant.findUnique({
    where: { id },
  });
  if (!klant) throw ServiceError.notFound(`Klant met id ${id} bestaat niet!`);
};
