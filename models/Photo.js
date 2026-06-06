const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Photo = sequelize.define('Photo', {
  category: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, allowNull: true },
  imagePath: { type: DataTypes.STRING, allowNull: false },
  sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'photos'
});

module.exports = { Photo };
