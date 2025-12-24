
exports.up = function(knex) {
  return knex.schema.createTable('team_memberships', table =>{
    table.increments('id');
    table.integer('team_id');
    table.integer('user_id');
    table.enu('role', ['Project Manager', 'Team Member']).notNullable()
    table.timestamp('joined_at').defaultTo(knex.fn.now());

    //foreign tables such USERS AND TASKS
    table.foreign('team_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('team_memberships');
};