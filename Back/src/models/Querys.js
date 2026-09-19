const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Query = sequelize.define(
    'Query',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Usuario autenticado que solicitó la consulta.
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Datos enviados inicialmente a Tusdatos.
      document_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      document_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Solo aplica a consultas de vehículo (placa + propietario).
      owner_document_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      owner_document_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      expedition_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // Se completa cuando Tusdatos devuelve la información.
      search_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Control interno del ciclo de vida de la consulta.
      status: {
        type: DataTypes.ENUM(
          'pending',
          'processing',
          'completed',
          'failed'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      risk_level: {
        type: DataTypes.ENUM(
          'unknown',
          'low',
          'medium',
          'high'
        ),
        allowNull: false,
        defaultValue: 'unknown',
      },

      // Información para rastrear la respuesta de Tusdatos.
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'tusdatos',
      },

      provider_request_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      provider_report_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Aquí guardaremos el JSON completo devuelto por Tusdatos.
      provider_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // Resumen pequeño y propio de Verifik para mostrar en pantalla.
      result_summary: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      provider_error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      pdf_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Evidencia de que el titular autorizó la consulta.
      consent_given: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      consented_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Evita descontar o reintegrar el crédito más de una vez.
      credit_charged_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      credit_refunded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      completed_at: {
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

  return Query
}
