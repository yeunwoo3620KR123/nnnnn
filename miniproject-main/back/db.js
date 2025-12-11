const mariadb = require('mariadb')
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

module.exports = pool