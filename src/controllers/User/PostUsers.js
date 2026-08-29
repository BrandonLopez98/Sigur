const { User } = require('../../db');

module.exports = async (usuariosArray) => {
  try {
    // Validar que se reciba un arreglo válido y no esté vacío
    if (!Array.isArray(usuariosArray) || usuariosArray.length === 0) {
      throw new Error('Se requiere un arreglo de usuarios válido para el registro masivo.');
    }

    const resultados = [];
    const errores = [];

    // Validar y procesar cada usuario
    for (let i = 0; i < usuariosArray.length; i++) {
      const { email, passwordHash, status, role } = usuariosArray[i];

      if (!email || !passwordHash) {
        errores.push(`El usuario en la posición ${i} no tiene email o passwordHash.`);
        continue;
      }

      // Verificar si ya existe en la base de datos
      const usuarioExistente = await User.findOne({ where: { email } });
      if (usuarioExistente) {
        errores.push(`El correo ${email} ya está registrado.`);
        continue;
      }

      // Crear el usuario individualmente para respetar hooks o defaults si aplica
      const nuevoUsuario = await User.create({
        email,
        password_hash: passwordHash,
        status,
        role,
      });

      resultados.push(nuevoUsuario);
    }

    // Si hubo errores, puedes decidir si retornar los creados junto con los errores o lanzar un error general
    if (errores.length > 0 && resultados.length === 0) {
      throw new Error(`Falló el registro masivo: ${errores.join(' | ')}`);
    }

    return {
      creados: resultados,
      errores: errores.length > 0 ? errores : undefined
    };
  } catch (error) {
    console.error('Error en el registro masivo de usuarios:', error.message);
    throw error;
  }
};