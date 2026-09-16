const bcrypt = require('bcryptjs');
const { User, CreditWallet, conn } = require('../../db')

// Número de rondas usadas para cifrar las contraseñas.
const SALT_ROUNDS = 12;

/**
 * Crea varios usuarios iniciales desde Users.json.
 * La contraseña del JSON se cifra antes de guardarse en la base de datos.
 */
module.exports = async (usuariosArray) => {
  try {
    if (!Array.isArray(usuariosArray) || usuariosArray.length === 0) {
      throw new Error('Se requiere un arreglo de usuarios válido.');
    }

    const resultados = [];
    const errores = [];

    for (let index = 0; index < usuariosArray.length; index += 1) {
      // passwordHash es el nombre actual del JSON; contiene la contraseña inicial.
      const {
        email,
        passwordHash: password,
        status,
        role,
      } = usuariosArray[index];

      if (!email || !password) {
        errores.push(`El usuario en la posición ${index} no tiene email o contraseña.`);
        continue;
      }

      const usuarioExistente = await User.findOne({ where: { email } });

      if (usuarioExistente) {
        errores.push(`El correo ${email} ya está registrado.`);
        continue;
      }

      // Nunca guardamos la contraseña original directamente en la base.
      const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const nuevoUsuario = await User.create({
        email,
        password_hash: encryptedPassword,
        status,
        role,
      });
      await CreditWallet.create({
        user_id: nuevoUsuario.id,
        balance: 0,
      })

      resultados.push(nuevoUsuario);
    }

    return {
      creados: resultados,
      errores: errores.length > 0 ? errores : undefined,
    };
  } catch (error) {
    console.error('Error en el registro masivo de usuarios:', error.message);
    throw error;
  }
};