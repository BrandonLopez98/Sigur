const { DataTypes } = require('sequelize')

/**
 * Catálogo comercial de créditos.
 *
 * Todos los paquetes dan acceso a la misma verificación Verifik.
 * Solo cambia la cantidad de créditos, el precio y si se destaca como popular.
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

      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      // Solo controla la etiqueta visual “Más popular”.
      is_popular: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

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