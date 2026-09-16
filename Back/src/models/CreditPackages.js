const { DataTypes } = require('sequelize')

/**
 * Paquetes de créditos que el cliente puede adquirir.
 */
module.exports = (sequelize) => {
  const CreditPackage = sequelize.define(
    'CreditPackage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      credits_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      // Valor del paquete en pesos colombianos.
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      // Un paquete inactivo no se muestra ni se puede comprar.
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  return CreditPackage
}