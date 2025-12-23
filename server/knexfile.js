require('dotenv').config();

module.exports = {

// if NODE.ENV is development it connect to db under development mode, used for developing features or bug-fixing. This file actually connect with db bringing table knex schema from migrations
//Change value of NODE.ENV in .env
  development: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      user: process.env.DB_USERNAME || 'root',
      database: process.env.DB_DATABASE || 'collabflow',
      //Write your password in .env file for connecting with db
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
// if NODE.ENV is production it connect to db under production mode, it's used for production application and leaks less information, when it comes to errors.
  production: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      port: process.env.DB_PORT || 14489,
      user: process.env.DB_USERNAME || 'root',
      database: process.env.DB_DATABASE || 'collabflow',
      //Write your password in .env file for connecting with db
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
