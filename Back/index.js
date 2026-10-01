//                       _oo0oo_
//                      o8888888o                                              
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//DB_User=estebanlopez
//DB_Password=
//DB_host=localhost
//DB_Name=verifik
//PORT=3001

const server = require('./src/app.js');
const { conn, User, CreditPackage } = require('./src/db.js')
const { getTusdatosConfig } = require('./src/services/tusdatosApi')
const { startTusdatosQueryMonitor } = require('./src/services/tusdatosQueryLifecycle')
const PORT = process.env.PORT || 3001;

async function loadData() {
  if (process.env.SEED_DEMO_DATA !== 'true') return

  try {
    const postUsers = require('./src/controllers/User/PostUsers.js')
    const postQueriesArray = require('./src/controllers/Query/postQuerys.js')
    const UsersData = require('./json/Users.json')
    const QueriesData = require('./json/Queries.json')
    // Los datos JSON solo se usan para preparar una base vacía.
    // Así no se duplican consultas ni se reemplazan usuarios reales al reiniciar.
    const usersCount = await User.count();

    if (usersCount > 0) {
      console.log('Database already contains data. Seed skipped.');
      return;
    }

    await postUsers(UsersData);
    console.log('Users data loaded.');
    await postQueriesArray(QueriesData);
  } catch (error) {
    console.error('Error loading data:', error.message);
  }
}

/**
 * Carga los paquetes iniciales una sola vez.
 * Si ya existe un paquete con ese nombre, no lo duplica.
 */
async function loadCreditPackages() {
  if (process.env.SEED_DEMO_DATA !== 'true') return

  try {
    const CreditPackagesData = require('./json/CreditPackages.json')
    for (const creditPackage of CreditPackagesData) {
      await CreditPackage.findOrCreate({
        where: {
          name: creditPackage.name,
        },
        defaults: creditPackage,
      })
    }

    console.log('Credit packages loaded.')
  } catch (error) {
    console.error('Error loading credit packages:', error.message)
  }
}

async function startServer() {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (process.env.DB_SYNC_FORCE === 'true') {
        throw new Error('DB_SYNC_FORCE no puede estar activo en producción.')
      }

      if (process.env.SEED_DEMO_DATA === 'true') {
        throw new Error('SEED_DEMO_DATA no puede estar activo en producción.')
      }

      // Falla de forma segura si la URL no usa HTTPS o si las credenciales de
      // Tusdatos no están completas antes de aceptar consultas reales.
      getTusdatosConfig()
    }

    await conn.sync({ force: process.env.DB_SYNC_FORCE === 'true' });
    console.log('Database synchronized.');

    // Ejecutamos la precarga del JSON de usuarios
    await loadData();
    await loadCreditPackages();

    // Iniciamos el servidor
    server.listen(PORT, () => {
      console.log(`%s listening at ${PORT}`);
      startTusdatosQueryMonitor()
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
