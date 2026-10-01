# Verifik

Aplicación B2C para solicitar, procesar y presentar verificaciones de datos. El repositorio contiene
un backend en Node.js, Express, Sequelize y PostgreSQL, y un frontend en React con Vite.

## Requisitos de desarrollo

- Node.js `24.20.0` (declarado en `.nvmrc`).
- npm `11.19.x`.
- PostgreSQL `15.x` como versión objetivo de la línea base actual.
- Dos terminales para ejecutar backend y frontend durante el desarrollo.

Si usas `nvm`:

```bash
nvm install
nvm use
```

## Preparación local

1. Instala las dependencias bloqueadas:

   ```bash
   npm run install:all
   ```

2. Crea los archivos locales de configuración:

   ```bash
   cp Back/.env.example Back/.env
   cp Frond/.env.example Frond/.env
   ```

3. Configura en `Back/.env` una base PostgreSQL exclusivamente local. No reutilices credenciales ni
   datos de producción.

4. Mantén `DB_SYNC_FORCE=false` y `SEED_DEMO_DATA=false` salvo que estés preparando desde cero una
   base local desechable.

Los archivos `.env` están ignorados por Git. Nunca se deben copiar secretos, tokens o datos
personales reales a documentación, fixtures o pruebas.

## Ejecución

Backend con recarga automática:

```bash
npm run dev:back
```

Frontend:

```bash
npm run dev:front
```

Direcciones locales predeterminadas:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Salud del backend: `http://localhost:3001/Health`

Detén cada proceso con `Ctrl+C`. El comando de producción del backend usa Node directamente:

```bash
npm start --prefix Back
```

El frontend de producción se genera en `Frond/dist` y debe publicarse mediante un servidor web o
servicio de archivos estáticos; `vite preview` solo sirve para revisar localmente el resultado.

## Verificación

Ejecuta toda la línea base desde la raíz:

```bash
npm run verify
```

También puedes ejecutar cada control por separado:

```bash
npm test
npm run lint
npm run build
```

## Datos de demostración

Los archivos de `Back/json` contienen exclusivamente valores ficticios identificados con dominios
`example.invalid`, documentos `DEMO-*` y nombres marcados como no reales. Solo se cargan cuando
`SEED_DEMO_DATA=true`, y el backend rechaza expresamente esa opción en producción.

Las contraseñas de demostración son públicas y no pueden utilizarse fuera de una base local
desechable.

## Estado de las migraciones

El sistema general de migraciones y rollback se implementará en `CODE-00B`. Mientras tanto:

- no ejecutes el script `migrate:tusdatos` sobre producción sin respaldo y revisión del SQL;
- no habilites `DB_SYNC_FORCE` sobre una base que debas conservar;
- no asumas que `sequelize.sync()` reemplaza una migración versionada;
- verifica manualmente la versión real del servidor PostgreSQL antes de cualquier cambio de esquema.

Los procedimientos formales de respaldo, restauración y rollback también pertenecen a `CODE-00B`.

## Estructura

- `Back/`: API, modelos, servicios y pruebas del backend.
- `Frond/`: interfaz React.
- `docs/`: auditorías y planes de trabajo.
- `graphify-out/`: grafo técnico generado; no contiene la fuente principal del producto.

Consulta [Back/README.md](Back/README.md) y [Frond/README.md](Frond/README.md) para los comandos
específicos de cada aplicación.
