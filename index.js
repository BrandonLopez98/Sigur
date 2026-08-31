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

const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const PORT = process.env.PORT || 3001;

const postUsers = require('./src/controllers/User/PostUsers.js');
const UsersData = require('./json/Users.json');

async function loadData() {
  try {
    await postUsers(UsersData);
    console.log('Users data loaded.');
  } catch (error) {
    console.error('Error loading data:', error.message);
  }
}

async function startServer() {
  try {
    // Sincronizamos la base de datos
    await conn.sync({ force: true });
    console.log('Database synchronized.');

    // Ejecutamos la precarga del JSON de usuarios
    await loadData();

    // Iniciamos el servidor
    server.listen(PORT, () => {
      console.log(`%s listening at ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
