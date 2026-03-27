import { prisma } from '../data';
import type { GebruikerCreateInput, GebruikerUpdateInput } from '../types/gebruiker'; 
import ServiceError from '../core/serviceError';
import handleDBError from './_handleDBError';
import type { PublicGebruiker } from '../types/gebruiker';
import jwt from 'jsonwebtoken';
import { getLogger } from '../core/logging'; 
import { generateJWT, verifyJWT } from '../core/jwt'; 
import type { SessionInfo } from '../types/auth'; 
import { hashPassword, verifyPassword } from '../core/password'; 

export const PUBLIC_GEBRUIKER_SELECT = {
  id: true,
  btw_nummer: true,
  bedrijfsnaam: true,
  voornaam: true,
  achternaam: true,
  telefoonnummer: true,
  email: true,
  adres: {
    select: {
      id: true,
      land : true,
      straat: true,
      nr: true,
      stadsnaam: true,
      postcode: true,
    },
  },
};

const PRIVATE_GEBRUIKER_SELECT = {
  ...PUBLIC_GEBRUIKER_SELECT,
  wachtwoord_hash: true,
  rollen: true,
};

export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  const user = await prisma.gebruiker.findUnique({
    where: {
      email,
    },
    select: PRIVATE_GEBRUIKER_SELECT,
  });

  if (!user) {
    // DO NOT expose we don't know the user
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
  }

  const passwordValid = await verifyPassword(password, user.wachtwoord_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
  }

  return await generateJWT(user); // 👈 6
};

export const registerUser = async (bedrijf : GebruikerCreateInput) : Promise<string> => {
  try {
    const {wachtwoord, adres, ...bedrijfData} = bedrijf;
    const wachtwoord_hash = await hashPassword(wachtwoord);

    // Wanneer een bedrijf/gebruiker wordt aangemaakt, moet zijn adres ook aangemaakt worden!
    const user = await prisma.gebruiker.create({
      data: {
        ...bedrijfData,
        wachtwoord_hash,
        rollen: ['user'],
        adres: {
          create: {
            ...adres,
          },
        },
      },
      select: {
        ...PUBLIC_GEBRUIKER_SELECT,
        wachtwoord_hash: true,
        rollen: true,
      },
    });

    if (!user) throw ServiceError.internalServerError('Er is iets misgegaan, bedrijf kon niet worden aangemaakt!');

    return await generateJWT(user);
  } catch (error) {
    throw handleDBError(error);
  }
};

export const getAll = async () : Promise<PublicGebruiker[]> => {
  return await prisma.gebruiker.findMany({
    select : PUBLIC_GEBRUIKER_SELECT,
  });
};

export const getById = async (id: number) : Promise<PublicGebruiker> => {
  const bedrijf = await prisma.gebruiker.findUnique({
    where: {
      id,
    },
    select : PUBLIC_GEBRUIKER_SELECT,
  });
    
  if (!bedrijf) throw ServiceError.notFound(`Bedrijf met id ${id} bestaat niet!`);
    
  return bedrijf;
};

export const updateById = async (id: number, gebruiker: GebruikerUpdateInput): Promise<PublicGebruiker> => {
  try {
    const { adres, ...bedrijfData } = gebruiker;

    return prisma.gebruiker.update({
      where: {
        id,
      },
      data: {
        ...bedrijfData,
        adres: {
          update: adres,
        },
      },
      select: PUBLIC_GEBRUIKER_SELECT,
    });
  } catch (error) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number) => {
  try {
    await prisma.gebruiker.delete({
      where: {
        id,
      },
    });
  } catch (error : any) {
    console.log(error);
    throw handleDBError(error);
  }
};

export const checkAndParseSession = async (
  authHeader?: string,
): Promise<SessionInfo> => {
  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);

  try {
    const { rollen, sub } = await verifyJWT(authToken); 

    return {
      gebruikerId: Number(sub),
      rollen,
    };
  } catch (error: any) {
    getLogger().error(error.message, { error });

    if (error instanceof jwt.TokenExpiredError) {
      throw ServiceError.unauthorized('The token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw ServiceError.unauthorized(
        `Invalid authentication token: ${error.message}`,
      );
    } else {
      throw ServiceError.unauthorized(error.message);
    }
  }
};

export const checkRole = (role: string, roles: string[]): void => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw ServiceError.forbidden(
      'You are not allowed to view this part of the application',
    );
  }
};
