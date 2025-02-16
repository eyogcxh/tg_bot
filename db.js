const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
  'name_db',
  'postgres',
  '0000',
  {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
  }
)