// Knex schema for MySQL
exports.up = function(knex) {
  return knex.schema.createTable('projects', table =>{
    table.increments('id');
    table.string('name', 100).notNullable();
    table.text('description');
    table.date('start_date');
    table.date('end_date');
    table.enu('status', ['Planning', 'In Progress', 'Completed'])
    .notNullable()
    .defaultTo('Planning');
    table.integer('team_id').unsigned();
    table.integer('created_by').unsigned();
    table.timestamp('created_at').defaultTo(knex.fn.now());
//brings data from foreign table TEAMS and USERS tables
    table.foreign('team_id').references('id').inTable('teams').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
  })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
