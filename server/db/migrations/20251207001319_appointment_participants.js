
exports.up = function(knex) {
  return knex.schema.createTable('appointment_participants', table =>{
    table.increments('id');
    table.integer('appointment_id');
    table.integer('user_id');
    table.timestamp('invited_at').defaultTo(knex.fn.now());

    //foreign tables such USERS AND APPOINTMENTS
    table.foreign('appointment_id').references('id').inTable('appointments').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
};

//drop table
exports.down = function(knex) {
  return knex.schema.dropTable('appointment_participants');
};
