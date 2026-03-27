import ServiceError from '../core/serviceError'; // 👈 2

const handleDBError = (error: any) => {
  const { code = '', message } = error;

  if (code === 'P2002') {
    switch (true) {
      case message.includes('idx_btw_nummer_unique'):
        throw ServiceError.validationFailed(
          'A place with this name already exists',
        );
      case message.includes('idx_user_email_unique'):
        throw ServiceError.validationFailed(
          'There is already a user with this email address',
        );
      default:
        throw ServiceError.validationFailed('This item already exists');
    }
  }

  if (code === 'P2025') {
    switch (true) {
      case message.includes('fk_land_adres'):
        throw ServiceError.notFound('Deze plaats bestaat niet');
      case message.includes('fk_bedrijf_adres'):
        throw ServiceError.notFound('Deze plaats bestaat niet');
      case message.includes('fk_klant_adres'):
        throw ServiceError.notFound('Deze plaats bestaat niet');
      case message.includes('fk_leverancier_adres'):
        throw ServiceError.notFound('Deze plaats bestaat niet');
      case message.includes('fk_bedrijf_leverancier'):
        throw ServiceError.notFound('Deze leverancier bestaat niet');
      case message.includes('fk_bedrijk_klant'):
        throw ServiceError.notFound('Deze klant bestaat niet');
      case message.includes('fk_bedrijf_verkoop'):
        throw ServiceError.notFound('Deze verkoop bestaat niet');
      case message.includes('fk_bedrijf_aankoopfactuur'):
        throw ServiceError.notFound('Deze aankoopfactuur bestaat niet');
      case message.includes('fk_aankoopfactuur_aankoop'):
        throw ServiceError.notFound('Deze aankoop bestaat niet');
      case message.includes('fk_verkoopfactuur_verkoop'):
        throw ServiceError.notFound('Deze verkoopfactuur bestaat niet');
      case message.includes('fk_verkoopfactuur_klant'):
        throw ServiceError.notFound('Deze klant bestaat niet');
      case message.includes('fk_leverancier_aankoopfactuur'):
        throw ServiceError.notFound('Deze aankoopfactuur bestaat niet');
      case message.includes('fk_aankoop_categorie_aankoop'):
        throw ServiceError.notFound('Deze aankoopcategorie bestaat niet');
      case message.includes('fk_btw_regime_verkoop'):
        throw ServiceError.notFound('Deze btw regime bestaat niet');

      case message.includes('adres'):
        throw ServiceError.notFound('Er bestaat geen adres met deze id');
      case message.includes('gebruiker'):
        throw ServiceError.notFound('Er bestaat geen gebruiker met deze id');
      case message.includes('aankoopfactuur'):
        throw ServiceError.notFound('Er bestaat geen aankoopfactuur met deze id');
      case message.includes('verkoopfactuur'):
        throw ServiceError.notFound('Er bestaat geeen verkoopfactuur met deze id');
      case message.includes('klant'):
        throw ServiceError.notFound('Er bestaat geen klant met deze id');
      case message.includes('leverancier'):
        throw ServiceError.notFound('Er bestaat geen leverancier met deze id');
      case message.includes('aankoopcategorieen'):
        throw ServiceError.notFound('Er bestaat geen aankoopcategorie met deze id');
      case message.includes('aankoop'):
        throw ServiceError.notFound('Er bestaat geen aankoop met deze id');
      case message.includes('btw_regimes'):
        throw ServiceError.notFound('Er bestaat geen btw regime met deze id');
      case message.includes('verkoop'):
        throw ServiceError.notFound('Er bestaat geen verkoop met deze id');
    }
  }

  if (code === 'P2003') {
    switch (true) {
      case message.includes('land_id'):
        throw ServiceError.conflict(
          'Deze land bestaat niet of is nog gelinkt aan een adres',
        );
      case message.includes('adres_id'):
        throw ServiceError.conflict(
          'Dit adres bestaat niet of is nog gelinkt aan een ander bedrijf, klant of leverancier!',
        );
      case message.includes('leverancier_id'):
        throw ServiceError.conflict(
          'Deze leverancier bestaat niet of is nog gelinkt aan een aankoopfactuur',
        );
      case message.includes('bedrijf_id'):
        throw ServiceError.conflict(
          'Dit bedrijf bestaat niet of is nog gelinkt aan een aankoopfactuur of verkoopfactuur',
        );
      case message.includes('klant_id'):
        throw ServiceError.conflict(
          'Deze klant bestaat niet of is nog gelinkt aan een verkoopfactuur',
        );
      case message.includes('aankoop_categorie_id'):
        throw ServiceError.conflict(
          'Deze aankoopcategorie bestaat niet of is nog gelinkt aan een aankoop',
        );
      case message.includes('btw_percentage_id'):
        throw ServiceError.conflict(
          'Deze btw percentage bestaat niet of is nog gelinkt aan een verkoop',
        );
    }
  }
  
  // Rethrow error because we don't know what happened
  throw error;
};

export default handleDBError; // 