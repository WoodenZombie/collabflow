
exports.up = function(knex) {
  return knex.schema.createTable('users', table =>{
    table.increments('id');
    table.string('name', 100).notNullable();
    table.string('email', 150).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('refresh_token', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
