require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { DB_User, DB_Password, DB_host, DB_Name } = process.env;

const sequelize = new Sequelize(
  `postgres://${DB_User}:${DB_Password}@${DB_host}/${DB_Name}`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed 
  }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { User, Query, UserProfile, CreditWallet } = sequelize.models;

// Aca vendrian las relaciones
// Un usuario puede tener muchas consultas (Querys)
User.hasMany(Query, { foreignKey: 'user_id' });
Query.belongsTo(User, { foreignKey: 'user_id' });
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

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};