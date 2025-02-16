const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
  'name_db',
  'name_user',
  'password_db',
  {
    host: 'id_server',
    port: 'server_port',
    dialect: 'postgres'
  }
)