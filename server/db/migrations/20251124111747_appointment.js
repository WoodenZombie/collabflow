exports.up = function (knex) {
  return knex.schema.createTable("appointments", (table) => {
    table.increments("id");
    table.integer("project_id");
    table.integer("team_id");
    table.string("title", 255).notNullable();
    table.text("description");
    table.date("start_time");
    table.integer("duration");
    table.string("location", 255).notNullable();
    table.integer("created_by");
    table.timestamp("created_at");

    //data from foreign tables PROJECTS and USERS
    table
      .foreign("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .foreign("project_id")
      .references("id")
      .inTable("projects")
      .onDelete("SET NULL");
    table
      .foreign("team_id")
      .references("id")
      .inTable("teams")
      .onDelete("SET NULL");
    x;
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("appointments");
};
