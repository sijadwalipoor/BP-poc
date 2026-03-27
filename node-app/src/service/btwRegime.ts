import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { BtwRegime } from '../types/btwRegime';
import handleDBError from './_handleDBError';

export const BTW_REGIMES_SELECT = {
  id: true,
  omschrijving: true,
  btw_percentage: true,
};

export const getAll = async (): Promise<BtwRegime[]> => {
  return prisma.btwRegime.findMany({
    select : BTW_REGIMES_SELECT,
  });
};

export const getById = async (id: number): Promise<BtwRegime> => {
  try {
    const btwRegime = await prisma.btwRegime.findUnique({
      where: {
        id,
      },
      select: BTW_REGIMES_SELECT,
    });
  
    if (!btwRegime) throw ServiceError.notFound(`Btw-regime met id ${id} bestaat niet!`);
    
    return btwRegime;
  } catch (error) {
    throw handleDBError(error);
  }
};
