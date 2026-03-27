import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Verkoop, VerkoopCreateInput, VerkoopUpdateInput } from '../types/verkoop';
import handleDBError from './_handleDBError';
import Role from '../core/roles';

const VERKOOPFACTUUR_SELECT = {
  id: true,
  factuurnummer: true,
  klant: true,
};

const BTW_REGIMES_SELECT = {
  id: true,
  btw_percentage: true,
  omschrijving: true,
};

const VERKOOP_SELECT = {
  id: true,
  verkoopfactuur: {
    select: VERKOOPFACTUUR_SELECT,
  },
  omschrijving: true,
  bedrag: true,
  btw_regime: {
    select : BTW_REGIMES_SELECT,
  },
};

export const getAll = async (gebruikerId : number, rollen : string[]): Promise<Verkoop[]> => {
  return prisma.verkoop.findMany({
    where : rollen.includes(Role.ADMIN) ? {} : { 
      verkoopfactuur: {
        gebruiker_id: gebruikerId,
      },
    },
    select: VERKOOP_SELECT,
  });
};

export const getAllByBtwRegime = 
  async (btw_regime: string | string[], gebruikerId : number): Promise<Verkoop[]> => {
    return prisma.verkoop.findMany({
      where: {
        btw_regime: {
          omschrijving : Array.isArray(btw_regime) ? { in: btw_regime } : btw_regime,
        },
        verkoopfactuur: {
          gebruiker_id: gebruikerId,
        },
      },
      select: VERKOOP_SELECT,
    });
  };

export const getById = async (id: number, gebruikerId : number, rollen : string[]): Promise<Verkoop> => {
  const extraFilter = rollen.includes(Role.ADMIN) ? {} : { verkoopfactuur : { gebruiker_id: gebruikerId } };

  const verkoop = await prisma.verkoop.findUnique({
    where: {
      id,
      ...extraFilter,
    },
    select: VERKOOP_SELECT,
  });

  if (!verkoop) throw ServiceError.notFound(`Verkoop met id ${id} bestaat niet!`);

  return verkoop;
};

export const create = async ({gebruiker_id, ...verkoop}: VerkoopCreateInput): Promise<Verkoop> => {
  try {
    const { factuur_id, btw_regime_id, ...verkoopData } = verkoop;
  
    return await prisma.verkoop.create({
      data: {
        ...verkoopData,
        btw_regime: {
          connect: { id: btw_regime_id },
        },
        verkoopfactuur: {
          connect: { 
            id: factuur_id,
            gebruiker_id: gebruiker_id,
          },
        },
      },
      select: VERKOOP_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const updateById = async (id: number, {gebruiker_id,...verkoop}: VerkoopUpdateInput): Promise<Verkoop> => {
  try {
    const { factuur_id, btw_regime_id, ...verkoopData } = verkoop;
    
    return await prisma.verkoop.update({
      where: {
        id,
        verkoopfactuur: {
          gebruiker_id,
        },
      },
      data: {
        ...verkoopData,
        verkoopfactuur: {
          connect: { 
            id: factuur_id,
            gebruiker_id: gebruiker_id,
          },
        },
        btw_regime: {
          connect: { id: btw_regime_id }, 
        },
      },
      select: VERKOOP_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number, gebruikerId : number): Promise<void> => {
  try {
    await prisma.verkoop.delete({
      where: {
        id,
        verkoopfactuur: {
          gebruiker_id: gebruikerId,
        },
      },
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

export const getAllVerkopenByFactuurId = async (factuur_id: number, gebruikerId : number): Promise<Verkoop[]> => {
  try {
    return prisma.verkoop.findMany({
      where: {
        factuur_id,
        verkoopfactuur: {
          gebruiker_id: gebruikerId,
        },
      },
      select: VERKOOP_SELECT,
    });
  } catch (error : any) {
    throw handleDBError(error);
  }
};

