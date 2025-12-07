// Knex schema for MySQL
exports.up = function(knex) {
  return knex.schema.createTable('tasks', table =>{
    table.increments('id');
    table.string('title', 255).notNullable();
    table.text('description');
    table.enu('priority', ['High', 'Medium', 'Low'])
    .notNullable()
    .defaultTo('Medium');
    table.enu('status_id', ['Pending', 'In Progress', 'Completed'])
    .notNullable();
    table.integer('project_id').unsigned();
    table.integer('team_id').unsigned();
    table.date('due_date');
    table.integer('created_by').unsigned();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
//brings data from foreign table PROJECT and USERS tables
    table.foreign('project_id').references('id').inTable('projects').onDelete('SET NULL');
    table.foreign('team_id').references('id').inTable('teams').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
  })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
};