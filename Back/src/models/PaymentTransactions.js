const { DataTypes } = require('sequelize')

/**
 * Registro de cada intento de compra de créditos.
 *
 * En desarrollo podemos crear transacciones de prueba.
 * Más adelante, wompi_transaction_id guardará el ID real de Wompi.
 */
module.exports = (sequelize) => {
  const PaymentTransaction = sequelize.define(
    'PaymentTransaction',
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

      package_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Puede ser null mientras el pago está pendiente de Wompi.
      wompi_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      // Precio pagado por el paquete en el momento de la compra.
      amount_paid: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'COP',
      },

      status: {
        type: DataTypes.ENUM('pending', 'approved', 'declined', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },

      // Ejemplos futuros: card, nequi, pse, bancolombia.
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Copia de los créditos comprados, útil aunque el paquete cambie después.
      credits_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  return PaymentTransaction
}