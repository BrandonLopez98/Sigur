const { DataTypes } = require('sequelize')

/**
 * Registra cada intento de compra de créditos.
 * Los créditos solo se acreditarán cuando Wompi confirme APPROVED
 * mediante el webhook del backend.
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
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      wompi_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      amount_paid: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'COP',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      credits_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credited_at: {
        type: DataTypes.DATE,
        allowNull: true,
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