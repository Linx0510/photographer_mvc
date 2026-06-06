const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingSlot = sequelize.define('BookingSlot', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'booking_slots'
});

module.exports = { BookingSlot };
