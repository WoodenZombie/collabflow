
exports.up = function(knex) {
  return knex.schema.createTable('teams', table =>{
    table.increments('id');
    table.string('name', 100).notNullable();
    table.text('description');
    table.integer('created_by').unsigned();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    //data from foreign tables USERS
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
  })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('teams');
};
