const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  perks: { type: DataTypes.TEXT, allowNull: true },
  isPopular: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'certificates'
});

module.exports = { Certificate };
