const sequelize = require('./db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chatId: { type: DataTypes.STRING, unique: true },
    username: { type: DataTypes.STRING },
    rightAnswers: { type: DataTypes.INTEGER, defaultValue: 0 },
    worngAnswers: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = User;