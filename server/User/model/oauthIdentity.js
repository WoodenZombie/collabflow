const db = require('../../db/db');

class OAuthIdentityModel {
  async findByProviderAndUserId(provider, providerUserId) {
    return db('oauth_identities')
      .where({ provider, provider_user_id: providerUserId })
      .first();
  }

  async create(identityData) {
    const [id] = await db('oauth_identities').insert(identityData);
    return db('oauth_identities').where({ id }).first();
  }
}

module.exports = new OAuthIdentityModel();