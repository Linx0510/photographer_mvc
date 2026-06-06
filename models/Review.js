const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  name:   { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  text:   { type: DataTypes.TEXT,    allowNull: false },
  approved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'reviews'
});

module.exports = { Review };
