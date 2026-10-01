const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', { // Cambió de 'users' a 'User'
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'active',
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'client',    },
  }, {
    // Las credenciales quedan excluidas por defecto de cualquier lectura. Los
    // dos flujos que necesitan verificar una contraseña usan unscoped().
    defaultScope: {
      attributes: {
        exclude: ['password_hash'],
      },
    },
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
