
exports.up = function(knex) {
  return knex.schema.createTable('project_memberships', table =>{
    table.increments('id');
    table.integer('project_id');
    table.integer('user_id');
    table.enu('role', ['Project Manager', 'Team Member']).notNullable()
    table.timestamp('joined_at').defaultTo(knex.fn.now());

    //foreign tables such USERS AND PROJECTS
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('project_memberships');
};