const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');
const { Certificate } = require('./Certificate');

const Purchase = sequelize.define('Purchase', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  certificateId: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: true },
  recipientName: { type: DataTypes.STRING, allowNull: true },
  wish: { type: DataTypes.TEXT, allowNull: true },
  clientName: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  bookingDate: { type: DataTypes.STRING, allowNull: true },
  bookingTime: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('new', 'approved', 'rejected', 'completed'), defaultValue: 'new' }
}, {
  tableName: 'purchases'
});

User.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

Certificate.hasMany(Purchase, { foreignKey: 'certificateId' });
Purchase.belongsTo(Certificate, { foreignKey: 'certificateId' });

module.exports = { Purchase };
