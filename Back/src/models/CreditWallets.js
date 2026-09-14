const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditWallet = sequelize.define('CreditWallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

  return CreditWallet;
};