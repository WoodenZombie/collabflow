require('dotenv').config();

module.exports = {



  development: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      user:process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      user:process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    }
  }

};
