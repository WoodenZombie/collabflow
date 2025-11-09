const knex = require('knex');
const knexfile = require('../knexfile');

// change environment depending which is write in .env(development or production)
//Write your password in .env file for connecting with db
const environment = process.env.NODE_ENV;
const db = knex(knexfile[environment]);
module.exports = db;
