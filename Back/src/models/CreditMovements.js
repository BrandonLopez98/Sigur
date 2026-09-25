const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const CreditMovement = sequelize.define(
    'CreditMovement',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // purchase, query_charge, query_refund o admin_adjustment.
      type: {
        type: DataTypes.ENUM(
          'purchase',
          'query_charge',
          'query_refund',
          'admin_adjustment'
        ),
        allowNull: false,
      },

      // Positivo suma créditos; negativo los descuenta.
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notZero(value) {
            if (value === 0) {
              throw new Error('El movimiento de créditos no puede ser cero.')
            }
          },
        },
      },

      // Saldo que queda inmediatamente después del movimiento.
      balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Identifica el pago, consulta o ajuste que generó el movimiento.
      source_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      source_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  )

  return CreditMovement
}