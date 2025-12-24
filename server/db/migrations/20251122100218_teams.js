
exports.up = function(knex) {
  return knex.schema.createTable('teams', table =>{
    table.increments('id');
    table.string('name', 100).notNullable();
    table.text('description');
    table.integer('created_by').unsigned();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('project_id').unsigned();

    //data from foreign tables USERS and PROJECTS
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('project_id').references('id').inTable('projects').onDelete('SET NULL');
  })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('teams');
};
