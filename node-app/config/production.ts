export default {
  log: {
    level: 'info',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:5173'], 
    maxAge: 3 * 60 * 60, 
  },
  auth: {
    jwt: {
      audience: 'boekhoudprogramma.hogent.be',
      issuer: 'boekhoudprogramma.hogent.be',
      expirationInterval: 60 * 60, // s (1 hour)
      secret:
        'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
    },
    argon: {
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
    maxDelay : 5000,
  },
};
  