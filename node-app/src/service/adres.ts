import { prisma } from '../data';
import ServiceError from '../core/serviceError';

export const checkIfAdresExists = async (id: number) => {
  const count = await prisma.adres.count({
    where: {
      id,
    },
  });
  
  if (count === 0) {
    throw ServiceError.notFound('No adres with this id exists');
  }
};