require('dotenv').config()
const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')

const { DB_User, DB_Password, DB_host, DB_Name } = process.env

const sequelize = new Sequelize(
  `postgres://${DB_User}:${DB_Password}@${DB_host}/${DB_Name}`,
  {
    logging: false,
    native: false,
  }
)

const basename = path.basename(__filename)
const modelDefiners = []

// Leemos todos los modelos almacenados en la carpeta models.
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)))
  })

// Inyectamos la conexión de Sequelize en cada modelo.
modelDefiners.forEach((model) => model(sequelize))

// Capitalizamos los nombres de modelos para importarlos de forma consistente.
const entries = Object.entries(sequelize.models)
const capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
])

sequelize.models = Object.fromEntries(capsEntries)

const {
  User,
  Query,
  UserProfile,
  CreditWallet,
  CreditPackage,
  PaymentTransaction,
} = sequelize.models

// Un usuario puede tener muchas consultas.
User.hasMany(Query, {
  foreignKey: 'user_id',
})

Query.belongsTo(User, {
  foreignKey: 'user_id',
})

// Cada usuario tiene un único perfil.
User.hasOne(UserProfile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE',
})

UserProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Cada usuario tiene una única billetera de créditos.
User.hasOne(CreditWallet, {
  foreignKey: 'user_id',
  as: 'wallet',
  onDelete: 'CASCADE',
})

CreditWallet.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Un usuario puede realizar muchas compras.
User.hasMany(PaymentTransaction, {
  foreignKey: 'user_id',
  as: 'payment_transactions',
  onDelete: 'CASCADE',
})

PaymentTransaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Un paquete puede aparecer en muchas transacciones.
CreditPackage.hasMany(PaymentTransaction, {
  foreignKey: 'package_id',
  as: 'transactions',
})

PaymentTransaction.belongsTo(CreditPackage, {
  foreignKey: 'package_id',
  as: 'package',
})

module.exports = {
  ...sequelize.models,
  conn: sequelize,
}