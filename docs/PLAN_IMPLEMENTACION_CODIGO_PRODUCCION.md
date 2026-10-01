# Plan de implementación de código hasta producción

## Propósito

Este plan organiza las modificaciones técnicas necesarias para llevar Verifik desde su estado
actual hasta una versión apta para producción B2C. Incluye backend, frontend, PostgreSQL,
Sequelize, autenticación, integración con proveedores, pagos, seguridad, pruebas y operación.

La existencia de este documento no autoriza todos los cambios de una vez. Antes de comenzar cada
bloque se presentará un plan específico y se solicitará aprobación.

## Método obligatorio de ejecución

Cada bloque seguirá este ciclo:

```text
Plan específico
  -> aprobación
  -> implementación
  -> pruebas
  -> revisión del diff
  -> aprobación para el siguiente bloque
```

Cada entrega deberá incluir:

- Alcance autorizado.
- Archivos que se modificarán.
- Migraciones requeridas.
- Riesgos y estrategia de reversión.
- Pruebas ejecutadas y resultados.
- Cambios pendientes o decisiones bloqueantes.
- Confirmación de que no se alteraron componentes fuera del alcance.

## Dependencias no técnicas bloqueantes

Antes de producción deberán estar resueltos:

- Autorización escrita para operación B2C.
- Autorización de reventa o distribución.
- Condiciones de marca blanca.
- Roles jurídicos de Verifik, clientes y proveedores.
- Identidad y canales oficiales del operador.
- Política de conservación de reportes y metadatos.
- Documentos legales aprobados.
- Procedimientos de habeas data e incidentes.

El desarrollo podrá avanzar mediante decisiones provisionales claramente documentadas, pero no
se deberá habilitar producción mientras subsistan estos bloqueos.

## CODE-00. Línea base y protección del trabajo

- Inventariar cambios locales y archivos sin seguimiento.
- Establecer estrategia de ramas, commits y revisiones.
- Documentar versiones de Node.js, PostgreSQL y dependencias.
- Separar configuración de desarrollo, pruebas, staging y producción.
- Prohibir datos personales reales en desarrollo y pruebas.
- Establecer respaldo y rollback de base de datos.
- Adoptar un sistema formal y secuencial de migraciones.
- Crear una línea base reproducible de pruebas del backend y frontend.
- Documentar cómo iniciar, probar y detener cada aplicación.

### Criterio de cierre

El entorno es reproducible, las migraciones son verificables y existe una estrategia de
recuperación antes de modificar datos persistentes.

## CODE-01. Correcciones críticas de resultados

- Impedir que el valor `Error` se muestre como “Sin hallazgos”.
- Implementar estados `finding`, `clear`, `error`, `unavailable` y `unknown`.
- Mostrar `unknown` como “Sin clasificación” o “Requiere revisión”.
- Evitar que el frontend convierta cualquier estado desconocido en riesgo bajo.
- Basar la identidad de los hallazgos en el campo estable `codigo`.
- Diferenciar fuente consultada, fuente fallida y fuente sin hallazgos.
- Conservar la categoría informativa sin convertirla automáticamente en riesgo.
- Añadir pruebas unitarias, de serialización y de interfaz.

### Criterio de cierre

Ningún estado incierto, desconocido o fallido puede producir una conclusión favorable.

## CODE-02. Seguridad inmediata de la API

- Reducir el límite global de cuerpos HTTP.
- Añadir límites específicos para login, consultas y webhooks.
- Incorporar cabeceras de seguridad.
- Configurar CORS explícitamente por ambiente.
- Añadir limitación de solicitudes.
- Normalizar errores sin filtrar información interna.
- Proteger rutas de usuarios, paquetes y administración.
- Impedir asignación arbitraria de roles o estados.
- Evitar exposición de `password_hash` y otros campos internos.
- Revisar IDOR y propiedad del recurso en todas las rutas.
- Eliminar o proteger endpoints de prueba y carga masiva.
- Revisar logs para evitar documentos, credenciales y respuestas sensibles.

### Criterio de cierre

La matriz de rutas está cubierta por pruebas de autenticación, autorización, propiedad y abuso.

## CODE-03. Autenticación y cuentas

- Revisar expiración, emisor, audiencia y contenido de JWT.
- Definir refresh tokens o sesiones renovables.
- Implementar revocación al cerrar sesión o cambiar contraseña.
- Fortalecer la política de contraseñas.
- Limitar intentos de inicio de sesión.
- Evitar enumeración de usuarios.
- Implementar verificación de correo.
- Implementar recuperación segura de contraseña.
- Revisar el almacenamiento del token en el frontend.
- Implementar roles y permisos explícitos.
- Auditar cambios sensibles de perfil, correo y contraseña.

### Criterio de cierre

Existen pruebas completas de registro, verificación, login, renovación, cierre, recuperación y
control de permisos.

## CODE-04. Adaptador robusto de Tusdatos

- Crear validadores para solicitudes y respuestas.
- Normalizar variantes de lanzamiento, progreso, reporte y recarga.
- Definir el comportamiento para `200`, `202`, `207`, `400`, `401`, `403`, `404`, `422`,
  `429` y errores `5xx`.
- Procesar `Retry-After` cuando corresponda.
- Tratar `401` y `403` como incidentes de credenciales o autorización.
- Manejar `429` sin aumentar la carga externa.
- Corregir el tratamiento de PDF cuando el proveedor responda `202` con JSON.
- Confirmar Basic, Bearer u OAuth por endpoint.
- Crear pruebas de contrato con muestras anonimizadas.
- Mantener una capa de corrección sobre la especificación OpenAPI externa.

### Criterio de cierre

Ninguna respuesta externa no validada entra directamente al dominio o a la interfaz de Verifik.

## CODE-05. Seguridad del webhook

- Validar esquema, tipos y tamaño del evento.
- Validar referencias, fechas e identificadores de reporte.
- Verificar la correspondencia con la consulta original.
- Aplicar limitación de solicitudes.
- Detectar eventos repetidos.
- Registrar auditoría sin datos sensibles.
- Permitir rotación controlada del secreto.
- Probar eventos válidos, inválidos, duplicados, tardíos y manipulados.
- Impedir que un reporte ajeno complete una consulta.

### Criterio de cierre

El webhook únicamente acelera una sincronización verificable y no se considera prueba suficiente
por sí solo para asociar cualquier reporte.

## CODE-06. Modelo de evidencia legal

Implementar migraciones y entidades para:

- Finalidad seleccionada.
- Justificación concreta.
- Confirmación de autorización firmada.
- Custodio de la autorización.
- Versión del formato de autorización.
- Versiones de términos, privacidad y aviso legal.
- Fecha y evidencia de aceptación.
- Versiones de documentos legales.
- Auditoría de accesos y descargas.
- Solicitudes de titulares.
- Reclamos en trámite.
- Bloqueos legales.
- Relaciones entre consultas renovadas.

La evidencia legal deberá separarse del resultado técnico de la consulta.

### Criterio de cierre

Cada consulta puede demostrar quién solicitó el tratamiento, qué aceptó, cuándo lo aceptó y para
qué finalidad.

## CODE-07. Flujo de consulta B2C

- Incorporar selección de finalidad.
- Exigir una justificación válida.
- Permitir descargar la autorización vigente.
- Explicar que el cliente conserva la carta firmada.
- Exigir declaraciones independientes y no premarcadas.
- Validar booleanos estrictos en el backend.
- Mostrar las versiones legales aplicables.
- Confirmar costo antes del cobro.
- Registrar la evidencia dentro de la misma operación transaccional.
- Rechazar finalidades prohibidas o insuficientes.

### Criterio de cierre

No puede iniciarse una consulta incompleta, sin finalidad, sin justificación o sin evidencia legal.

## CODE-08. Reporte Verifik

- Mostrar finalidad y fecha de generación.
- Mostrar fecha de vigencia.
- Añadir estados completo, parcial, vencido, archivado y bajo reclamo.
- Mostrar fuentes fallidas separadamente.
- Añadir advertencias sobre homónimos y búsquedas por nombre.
- Explicar categorías de hallazgos.
- Evitar lenguaje concluyente o discriminatorio.
- Conservar internamente el texto original.
- No sustituir indiscriminadamente el nombre del proveedor dentro de textos probatorios.
- Separar marca comercial, fuente oficial y proveedor técnico.
- Eliminar identificadores internos de respuestas públicas.
- Registrar visualizaciones e impresiones según el criterio de minimización aprobado.

### Criterio de cierre

El reporte informa el estado real de la consulta sin modificar el significado de los datos ni
presentar incertidumbre como certeza.

## CODE-09. Recarga de fuentes

- Mantener el reporte anterior hasta completar la recarga.
- Registrar cada intento como un evento independiente.
- Conservar fechas originales y fechas de actualización por fuente.
- Limitar frecuencia y cantidad de recargas.
- Evitar recargas paralelas.
- Garantizar que no exista cobro adicional.
- Evaluar la incorporación del webhook `individualRetry`.
- Mostrar exactamente qué fuentes se actualizaron y cuándo.
- Mantener el reporte anterior si la recarga falla.

### Criterio de cierre

La recarga no destruye historia, no cambia indebidamente fechas y no descuenta créditos.

## CODE-10. Vigencia, renovación y retención

- Calcular `valid_until` y `retention_until`.
- Notificar antes de los doce meses.
- Marcar el reporte como histórico al vencer.
- No renovar automáticamente.
- Exigir nueva autorización, finalidad y justificación.
- Crear relación entre consulta anterior y nueva.
- Archivar, anonimizar o eliminar el reporte según la política aprobada.
- Conservar únicamente la evidencia permitida.
- Implementar bloqueos por reclamo o deber legal.
- Definir el tratamiento de copias de respaldo.
- Registrar la ejecución y resultado de cada proceso de retención.

### Criterio de cierre

Pruebas automatizadas con reloj controlado cubren vigencia, aviso, renovación, archivo, bloqueo y
eliminación.

## CODE-11. Pagos y créditos

- Auditar checkout y webhook de Wompi.
- Validar firmas y repetición de eventos.
- Garantizar idempotencia de acreditaciones.
- Conciliar transacciones, billeteras y movimientos.
- Evitar saldos negativos por concurrencia.
- Probar pagos aprobados, rechazados, repetidos y demorados.
- Implementar procedimientos de reversión y ajuste auditado.
- Separar claramente crédito comprado, consumido, reintegrado y corregido.

### Criterio de cierre

Cada crédito puede rastrearse hasta una transacción o ajuste autorizado y ningún evento repetido
altera el saldo dos veces.

## CODE-12. Escalabilidad y operación

- Sustituir la cola de lanzamientos en memoria por coordinación distribuida antes de ejecutar
  varias instancias.
- Mantener leases seguros para el monitor.
- Evitar procesamiento duplicado entre instancias.
- Añadir métricas y alertas.
- Implementar logs estructurados y minimizados.
- Incorporar health checks de base de datos y dependencias.
- Definir rotación de secretos.
- Automatizar copias de seguridad y pruebas de restauración.
- Establecer tiempos de respuesta y escalamiento para incidentes.

### Criterio de cierre

Dos o más instancias pueden funcionar sin duplicar cobros, consultas, recargas o webhooks.

## CODE-13. Calidad y CI/CD

- Incorporar lint y formato.
- Añadir validación estática.
- Añadir pruebas de backend y frontend.
- Añadir pruebas de integración con PostgreSQL.
- Revisar dependencias vulnerables.
- Impedir commits de secretos.
- Ejecutar migraciones controladas.
- Construir artefactos reproducibles.
- Separar despliegue, migración y rollback.
- Generar evidencia de resultados por cada despliegue.

### Criterio de cierre

Ningún cambio puede desplegarse si fallan seguridad, pruebas, compilación o migraciones.

## CODE-14. Preparación de producción

Antes del lanzamiento deberán cumplirse estas puertas:

- Autorización escrita para B2C, reventa y marca blanca.
- Documentos legales aprobados.
- Matriz de rutas cerrada.
- Migraciones probadas.
- Retención configurada.
- Respaldos restaurados en una prueba.
- Sandbox aprobado.
- Pruebas de carga y concurrencia.
- Monitoreo y alertas activos.
- Plan de incidentes aprobado.
- Plan de rollback probado.
- Prueba integral con identidades autorizadas.
- Revisión final jurídica y técnica.
- Lista explícita de riesgos aceptados.

La puesta en producción será una aprobación separada. Terminar el desarrollo no autoriza
automáticamente el despliegue.

## Coordinación con el Plan de Trabajo desde ChatGPT Web

| Entregable Web GPT | Bloque de código dependiente |
| --- | --- |
| Decisiones legales | CODE-06 y CODE-10 |
| Documentos legales | CODE-07 y CODE-08 |
| Catálogo de finalidades | CODE-06 y CODE-07 |
| Flujos UX | CODE-07 y CODE-08 |
| Matrices de seguridad | CODE-02, CODE-03 y CODE-05 |
| Casos de aceptación | Todas las fases técnicas |
| Runbooks | CODE-12 y CODE-14 |
| Cuestionario a Tusdatos | CODE-04, CODE-05 y CODE-09 |

## Orden de ejecución recomendado

1. CODE-00: línea base y migraciones.
2. CODE-01: exactitud de resultados.
3. CODE-02: seguridad inmediata.
4. CODE-03: autenticación y cuentas.
5. CODE-04: contrato con Tusdatos.
6. CODE-05: webhook.
7. CODE-06: evidencia legal.
8. CODE-07: flujo B2C.
9. CODE-08: reporte.
10. CODE-09: recargas.
11. CODE-10: vigencia y retención.
12. CODE-11: pagos y créditos.
13. CODE-12: escalabilidad y operación.
14. CODE-13: CI/CD.
15. CODE-14: puertas de producción.

El orden podrá ajustarse después de revisar dependencias, pero CODE-01 y CODE-02 deberán tratarse
antes de ampliar el tratamiento o exposición de datos personales.

## Criterio de finalización

El plan técnico se considerará terminado cuando todos los bloques cumplan sus criterios de cierre,
los documentos legales y contratos estén aprobados, las pruebas sean satisfactorias y exista una
autorización independiente para desplegar en producción.
