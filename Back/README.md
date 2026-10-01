# Backend de Verifik

API de Verifik construida con Node.js, Express, Sequelize y PostgreSQL.

## Configuración

Desde la raíz del repositorio:

```bash
cp Back/.env.example Back/.env
npm ci --prefix Back
```

Completa `Back/.env` únicamente con credenciales locales o con secretos entregados mediante el
gestor seguro del entorno. Las variables se agrupan así:

- PostgreSQL: `DB_User`, `DB_Password`, `DB_host`, `DB_Name`.
- Aplicación: `PORT`, `NODE_ENV`, `JWT_SECRET`, `CORS_ORIGIN`.
- Integraciones: `TUSDATOS_*` y `WOMPI_*`.
- Seguridad local: `DB_SYNC_FORCE` y `SEED_DEMO_DATA`.

No uses datos personales reales en desarrollo ni actives semillas en producción.

## Comandos

```bash
# Desarrollo con recarga automática
npm run dev

# Ejecución sin Nodemon
npm start

# Pruebas unitarias
npm test
```

El servidor escucha en el puerto configurado por `PORT`, con valor predeterminado `3001`.

## Base de datos

La línea base actual usa PostgreSQL `15.x`. El servidor todavía ejecuta `sequelize.sync()` al
arrancar, pero esta operación no sustituye un sistema de migraciones.

Existe un script heredado para las columnas de seguimiento de Tusdatos:

```bash
npm run migrate:tusdatos
```

No lo ejecutes sobre una base compartida o productiva sin respaldo. Su conversión a una migración
versionada y reversible forma parte de `CODE-00B`.

`DB_SYNC_FORCE=true` elimina y recrea estructuras; solo puede utilizarse en una base local
desechable y está bloqueado cuando `NODE_ENV=production`.

## Datos demo

`SEED_DEMO_DATA=true` carga fixtures inequívocamente ficticios desde `Back/json` si la tabla de
usuarios está vacía. El arranque rechaza esta variable en producción.

Las claves demo son públicas y deben cambiarse o eliminarse al terminar la prueba local.

## Detención

Detén el proceso con `Ctrl+C`. Antes de producción se incorporará un procedimiento completo de
apagado controlado, migración y rollback.

La preparación completa del repositorio está documentada en [../README.md](../README.md).
