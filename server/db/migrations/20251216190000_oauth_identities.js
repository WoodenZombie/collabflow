exports.up = function (knex) {
    return knex.schema.createTable('oauth_identities', (table) => {
      table.increments('id').primary();
  
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onDelete('CASCADE');
  
      table.string('provider', 20).notNullable(); // 'google' | 'apple'
      table.string('provider_user_id', 255).notNullable(); // sub from id_token
      table.string('email', 150).nullable();
  
      table.timestamp('created_at').defaultTo(knex.fn.now());
  
      table.unique(['provider', 'provider_user_id']);
      table.index(['user_id']);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('oauth_identities');
  };