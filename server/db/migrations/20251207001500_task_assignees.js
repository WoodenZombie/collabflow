
exports.up = function(knex) {
  return knex.schema.createTable('task_assignees', table =>{
    table.increments('id');
    table.integer('task_id');
    table.integer('user_id');
    table.boolean('primary_assignee').defaultTo(false);
    table.timestamp('assigned_at').defaultTo(knex.fn.now());

    //foreign tables such USERS AND TASKS
    table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('task_assignees');
};