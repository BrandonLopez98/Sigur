# Plan de auditoría y aprendizaje del proyecto

## Planes de trabajo derivados

El trabajo consolidado en este documento se divide en dos rutas coordinadas:

- [Plan de trabajo desde ChatGPT Web](./PLAN_TRABAJO_WEB_GPT.md): documentación, decisiones,
  matrices, experiencia de usuario, pruebas de aceptación y preparación contractual que pueden
  realizarse sin IDE, Node.js ni acceso al repositorio.
- [Plan de implementación de código hasta producción](./PLAN_IMPLEMENTACION_CODIGO_PRODUCCION.md):
  modificaciones técnicas de backend, frontend, PostgreSQL, seguridad, integraciones, pruebas y
  operación.

Los entregables del plan web se convertirán en entradas verificables para el plan técnico. Ambos
mantienen la regla de aprobación previa antes de modificar código o autorizar producción.

## Contexto actual

El proyecto se encuentra en una fase de aprendizaje y comprensión del código existente.
El objetivo inmediato no es implementar cambios, sino entender la solución actual, sus
flujos de negocio, su arquitectura y su estado real antes de proponer modificaciones.

Durante esta fase no se modificará código de producción, configuración, base de datos,
migraciones ni pruebas. Cualquier implementación posterior deberá contar primero con un
plan específico y con la aprobación explícita del responsable del proyecto.

## Objetivo de la revisión

Realizar una revisión exhaustiva del proyecto de verificación de datos con enfoque B2C,
incluidos los casos de uso relacionados con arrendamientos, personal de aseo y los demás
perfiles que estén representados en el código o la documentación.

La revisión deberá producir un historial o checklist verificable de:

1. Funcionalidades pendientes según los requerimientos generales.
2. Puntos críticos de mejora en la arquitectura, estructura y calidad del código.
3. Estado de seguridad de las rutas, validaciones, autenticación y autorización.

## Reglas de trabajo

1. Antes de realizar cualquier cambio en el repositorio se presentará un plan.
2. No se modificará el código hasta recibir aprobación explícita del plan.
3. Si cambia el alcance, se presentará un plan actualizado antes de continuar.
4. Los hallazgos deberán estar sustentados con referencias concretas a archivos y líneas.
5. Se diferenciarán claramente los requisitos documentados de los requisitos inferidos.
6. Durante la fase actual solo se realizarán inspecciones y verificaciones de solo lectura.
7. No se alterarán datos reales ni se ejecutarán acciones contra servicios de producción.

## Plan de auditoría

### 1. Inventario del proyecto

- Revisar la estructura de carpetas y las instrucciones del repositorio.
- Identificar aplicaciones, módulos, dependencias y puntos de entrada.
- Revisar el estado de Git para distinguir el código existente de cambios locales.
- Mapear rutas, middlewares, controladores y servicios.
- Mapear modelos, asociaciones, migraciones y configuración de Sequelize/PostgreSQL.
- Identificar los sistemas de registro, login, recuperación de contraseña y autenticación.
- Localizar pruebas, documentación, scripts y configuración por variables de entorno.

### 2. Reconstrucción de requerimientos

- Extraer los requerimientos presentes en README, documentación, pruebas, migraciones y código.
- Identificar los flujos B2C implementados y las reglas de negocio asociadas.
- Clasificar cada requerimiento como:
  - Implementado.
  - Parcialmente implementado.
  - No implementado.
  - Inconsistente con otros componentes.
  - Inferido y pendiente de confirmación.

### 3. Revisión de arquitectura

- Evaluar la separación entre rutas, controladores, servicios y acceso a datos.
- Detectar responsabilidades mezcladas, código duplicado y acoplamiento innecesario.
- Revisar el manejo centralizado de errores y la consistencia de las respuestas HTTP.
- Evaluar el uso de transacciones y la atomicidad de las operaciones críticas.
- Revisar la configuración por ambientes y la administración de dependencias.
- Identificar consultas N+1, problemas de concurrencia y riesgos de rendimiento.
- Evaluar mantenibilidad, escalabilidad, capacidad de prueba y observabilidad.

### 4. Auditoría de autenticación y autorización

Seguir cada flujo completo:

```text
Solicitud -> ruta -> validación -> autenticación -> autorización
          -> controlador -> servicio -> Sequelize/PostgreSQL
```

Revisar, según lo utilizado en el proyecto:

- Registro e inicio y cierre de sesión.
- JWT, sesiones, cookies y refresh tokens.
- Hash y políticas de contraseñas.
- Recuperación y cambio de contraseña.
- Verificación de correo electrónico o teléfono.
- Expiración, rotación y revocación de tokens.
- Roles, permisos y propiedad de los recursos.
- Protección contra enumeración de usuarios, fuerza bruta e IDOR.

### 5. Matriz de seguridad de rutas

Preparar una matriz por endpoint que incluya:

- Método HTTP y URL.
- Controlador y servicio involucrados.
- Autenticación requerida.
- Rol o permiso esperado.
- Validación de parámetros, cuerpo, consultas y archivos.
- Comprobación de propiedad del recurso.
- Datos personales o sensibles expuestos.
- Riesgo identificado, severidad y recomendación.

Revisar especialmente:

- Inyección SQL y consultas Sequelize inseguras.
- Asignación masiva de atributos.
- CORS, cabeceras de seguridad y limitación de solicitudes.
- Gestión de secretos y variables de entorno.
- Logs con información sensible.
- Subida y procesamiento de archivos.
- Webhooks, enlaces públicos y tokens predecibles.
- Validación y normalización de entradas.
- Errores que puedan revelar información interna.

### 6. Pruebas y verificación

- Ejecutar únicamente las pruebas y analizadores ya configurados que sean seguros y de solo lectura respecto de datos reales.
- Comprobar que las rutas registradas coincidan con las protecciones esperadas.
- Revisar cobertura de escenarios positivos, negativos y límites.
- Identificar pruebas faltantes de autenticación, autorización y validación.
- Documentar fallos reproducibles con referencias concretas al código.
- No realizar ataques contra servicios externos ni modificar bases de datos productivas.

### 7. Entregable de la auditoría

El informe final de aprendizaje y auditoría contendrá:

- Resumen ejecutivo.
- Mapa de arquitectura y flujo de datos.
- Estado general por componente.
- Checklist de funcionalidades implementadas, parciales y pendientes.
- Hallazgos clasificados como críticos, altos, medios o bajos.
- Evidencias con referencias a archivos y líneas.
- Matriz de seguridad de rutas.
- Deuda técnica y riesgos arquitectónicos.
- Preguntas funcionales que requieran confirmación.
- Plan de remediación priorizado en correcciones inmediatas, próximo sprint y mejoras estructurales.
- Orden sugerido de implementación y criterios de aceptación.

## Criterio de cierre de la fase de aprendizaje

La fase se considerará terminada cuando exista una comprensión documentada de los módulos,
los flujos de negocio, el modelo de datos, las dependencias, los controles de acceso y los
principales riesgos. Terminar esta fase no autoriza automáticamente ninguna modificación:
cada bloque de implementación requerirá un plan separado y aprobación explícita.

---

# Plan consolidado de cumplimiento legal y correspondencia con el código

## Estado de este plan

Este bloque consolida las decisiones tomadas durante la revisión de la conversación legal
compartida, los documentos actuales de Verifik, los términos y la política de tratamiento de
datos del proveedor, y el código existente.

Su inclusión en este documento no autoriza todavía cambios en código, modelos, base de datos,
interfaz, documentos legales ni infraestructura. Cada fase de implementación deberá contar con
un plan específico y aprobación explícita antes de comenzar.

## Decisiones funcionales consolidadas

1. La marca comercial, la interfaz y los reportes visibles serán Verifik.
2. El cliente podrá descargar el modelo de autorización, deberá hacerlo firmar por la persona
   consultada y conservará el documento bajo su responsabilidad.
3. Como alcance inicial, Verifik no almacenará la carta firmada. Conservará evidencia de que el
   usuario declaró tenerla y poder acreditarla cuando sea requerida.
4. Ninguna consulta podrá ejecutarse sin una finalidad seleccionada y una justificación concreta.
5. El reporte se considerará vigente durante doce (12) meses desde su generación.
6. Al aproximarse el año se ofrecerá una nueva verificación, pero nunca se ejecutará
   automáticamente.
7. El registro de la consulta podrá conservarse durante cinco (5) años, sujeto a la definición
   jurídica de qué componentes se conservarán durante todo ese periodo.
8. Un reporte con doce meses o más deberá mostrarse como histórico o desactualizado, aunque el
   registro continúe retenido.
9. Las fuentes fallidas podrán recargarse sin consumir créditos adicionales.
10. Las fuentes que respondieron conservarán el resultado y la fecha de la consulta original;
    una recarga no deberá presentarlas como consultadas nuevamente.
11. Verifik no crea, modifica, corrige ni elimina los registros administrados por las fuentes.
12. La aplicación deberá advertir sobre homónimos, búsquedas por nombre, fuentes no disponibles
    y resultados parciales.
13. Verifik no tomará la decisión final de contratar, arrendar, aceptar o rechazar a una persona.

## Condición previa: operación B2C y marca blanca

La experiencia comercial debe mostrar únicamente la marca Verifik. No obstante, antes del
lanzamiento deberá obtenerse confirmación escrita del proveedor respecto de:

- Autorización para operar el servicio bajo un modelo B2C.
- Reventa, distribución o sublicenciamiento de las consultas.
- Licencia y condiciones de marca blanca.
- Posibilidad de mostrar reportes transformados bajo la identidad de Verifik.
- Roles de Verifik y del proveedor como Responsables, Encargados o subencargados.
- Conservación de reportes, evidencias y metadatos.
- Recarga de fuentes fallidas y condiciones económicas del reintento.
- Atención coordinada de consultas, reclamos, rectificaciones y supresiones.
- Transferencias o transmisiones nacionales e internacionales.

Se aplicará la siguiente separación:

- **Capa comercial pública:** identidad visual y lenguaje de Verifik.
- **Capa técnica interna:** identificación real del proveedor, sus solicitudes y sus respuestas.
- **Documentos legales públicos:** redacción jurídicamente suficiente sobre proveedores y
  transmisiones, sin incluir marcas innecesarias. Un abogado deberá determinar si el proveedor
  debe identificarse expresamente.
- **Contratos, inventarios y registros internos:** identificación completa de Data Factum S.A.S.
  y Tusdatos.co.

No se deberá ocultar información cuya divulgación sea legal o contractualmente obligatoria.

## Fase 0. Decisiones legales bloqueantes

Antes de editar documentos o implementar funcionalidades se deberá:

- Definir la identidad jurídica completa del operador de Verifik.
- Definir correo de hábeas data, teléfono, dirección y URL oficial.
- Determinar los roles jurídicos de Verifik, el cliente y los proveedores.
- Definir exactamente qué significa conservar una consulta durante cinco años:
  - Metadatos y trazabilidad.
  - Resumen normalizado.
  - Reporte completo.
  - Respuesta JSON original.
  - Evidencia de aceptación legal.
- Confirmar si el reporte completo se conservará cinco años o solamente doce meses.
- Determinar el procedimiento para solicitudes de supresión y bloqueos legales.
- Obtener revisión de un abogado colombiano antes del lanzamiento comercial.

### Criterio de aceptación

Existe una matriz de decisiones aprobada y no quedan contradicciones entre el modelo de negocio,
el contrato del proveedor, la política de datos, la autorización y el comportamiento esperado de
la aplicación.

## Fase 1. Actualización de documentos existentes

### 1. Política de Tratamiento y Protección de Datos Personales

Se deberá:

- Completar todos los campos identificados como pendientes.
- Identificar correctamente al operador de Verifik y sus canales oficiales.
- Incorporar el catálogo cerrado de finalidades.
- Separar vigencia del reporte, conservación de la consulta y conservación de trazabilidad.
- Explicar que la carta firmada queda bajo custodia del cliente en el alcance inicial.
- Explicar qué evidencia electrónica conserva Verifik sobre la declaración del usuario.
- Definir proveedores tecnológicos y transmisiones con una redacción compatible con la marca
  blanca y con los deberes de transparencia.
- Incorporar archivo, supresión, anonimización y bloqueo por reclamo.
- Definir el tratamiento de copias de respaldo.
- Definir gestión y notificación de incidentes.
- Regular datos sensibles, datos de menores e información financiera o crediticia.
- Prohibir el uso de información financiera o crediticia para decisiones laborales.
- Incorporar controles contra discriminación.
- Actualizar la tabla de conservación.
- Asignar versión, fecha de vigencia y procedimiento de actualización.

### 2. Modelo de autorización para consulta

Se deberá:

- Mantener como regla inicial que el cliente conserva la carta firmada.
- Aclarar que Verifik exigirá una declaración electrónica sobre su existencia y custodia.
- Utilizar las mismas finalidades y códigos que la aplicación.
- Incluir un campo para justificar la relación y necesidad de la consulta.
- Aclarar que una nueva verificación anual no queda autorizada automáticamente.
- Cubrir la recarga de fuentes fallidas como continuación de la consulta original.
- Diferenciar la vigencia informativa de doce meses y la retención aplicable al registro.
- Definir los canales de atención del cliente y de Verifik.
- Revisar jurídicamente si debe identificarse expresamente al proveedor tecnológico.
- Asignar número, versión y fecha al formato.

### 3. Aviso Legal de Consulta y Reporte

Se deberá:

- Incorporar la recarga gratuita de fuentes fallidas.
- Explicar que solamente se reintentan las fuentes que fallaron.
- Indicar que las fuentes exitosas mantienen su fecha original.
- Añadir una advertencia visible sobre el significado de un hallazgo alto.
- Evitar presentar “sin hallazgos” como “sin antecedentes”.
- Incorporar el catálogo de finalidades.
- Incorporar vigencia anual y retención quinquenal diferenciadas.
- Actualizar las declaraciones obligatorias previas a una consulta.
- Añadir versión legal y fecha de vigencia.

## Fase 2. Documentación faltante

### Documentos públicos

- Términos y Condiciones B2C.
- Aviso de privacidad corto.
- Política de cookies.
- Política de uso aceptable.
- Política de cancelación, retracto y devolución.
- Centro público de privacidad y hábeas data.
- Explicación de las categorías de fuentes consultadas.
- Explicación de hallazgos, homónimos, resultados parciales y fuentes fallidas.

### Documentos internos y contractuales

- Matriz Responsable–Encargado–Titular–Usuario.
- Acuerdo de transmisión de datos con proveedores.
- Contrato o anexo de operación B2C, reventa y marca blanca.
- Tabla oficial de retención.
- Procedimiento de archivo, supresión y anonimización.
- Procedimiento de consultas y reclamos.
- Procedimiento de incidentes de seguridad.
- Registro de versiones legales.
- Inventario de proveedores y transferencias.
- Evaluación de impacto de privacidad.
- Política interna de control de acceso.
- Procedimiento para aplicar la leyenda “reclamo en trámite”.

## Fase 3. Catálogo de finalidades

La aplicación deberá utilizar un catálogo cerrado. Como base inicial:

| Código | Opción visible | Alcance |
| --- | --- | --- |
| `PROPERTY_LEASE` | Arrendamiento de inmueble | Evaluación de un posible arrendatario. |
| `LEASE_GUARANTOR` | Codeudor, fiador o garante | Persona que respaldará el contrato de arrendamiento. |
| `DOMESTIC_EMPLOYMENT` | Contratación laboral de personal doméstico o de aseo | Relación laboral directa. |
| `CLEANING_SERVICES` | Contratación independiente de servicios de aseo | Prestación de servicios sin relación laboral. |
| `CAREGIVER` | Contratación de cuidador | Cuidado de menores, adultos mayores o dependientes. |
| `PRIVATE_DRIVER` | Contratación de conductor particular | Relación laboral o servicio independiente. |
| `HOME_SERVICES` | Servicios de mantenimiento dentro del hogar | Plomería, electricidad, jardinería o remodelación. |
| `INDEPENDENT_CONTRACTOR` | Contratación de trabajador independiente | Prestación de servicios profesionales o técnicos. |
| `PROPERTY_ADMINISTRATION` | Administración, vigilancia o portería | Acceso recurrente a un inmueble. |
| `VEHICLE_TRANSACTION` | Compra, venta o arrendamiento de vehículo | Validación del vehículo y de la contraparte. |
| `PRIVATE_CONTRACT` | Contrato entre particulares | Relación contractual legítima no incluida arriba. |
| `OTHER_REVIEW` | Otra finalidad contractual legítima | Exige explicación y revisión adicional. |

Además del catálogo, se exigirá una justificación de entre 30 y 500 caracteres. No se permitirán
finalidades como curiosidad, vigilancia personal, relaciones sentimentales, revisión de vecinos o
“uso personal” sin relación legítima.

## Fase 4. Modelo de datos legal

No se deberá resolver todo agregando campos desestructurados al modelo de consulta. La solución
deberá separar la consulta, la evidencia legal y el acceso al reporte.

### Campos propuestos para `Query`

- `purpose_code`
- `purpose_detail`
- `result_generated_at`
- `valid_until`
- `retention_until`
- `archived_at`
- `purged_at`
- `renewal_status`
- `renewal_offered_at`
- `supersedes_query_id`
- `superseded_by_query_id`
- `legal_hold_until`
- `legal_hold_reason`

### Entidad propuesta `QueryLegalEvidence`

- `query_id`
- `authorization_confirmed`
- `authorization_confirmed_at`
- `authorization_template_version`
- `authorization_custodian`
- `purpose_confirmed`
- `terms_accepted`
- `terms_version`
- `privacy_version`
- `legal_notice_version`
- `accepted_at`
- `request_id`
- Evidencia técnica adicional definida bajo un criterio de minimización.

En el alcance inicial no se almacenará la carta firmada; se registrará que el usuario declaró
conservarla y poder acreditarla.

### Entidad propuesta `LegalDocumentVersion`

- Tipo de documento.
- Versión.
- Fecha de vigencia.
- Hash del contenido.
- URL publicada.
- Estado publicado o retirado.

### Entidad propuesta `QueryAccessAudit`

- Consulta.
- Usuario.
- Acción: visualizar, descargar, reintentar, renovar, archivar o eliminar.
- Fecha y resultado.
- Datos técnicos minimizados.
- Motivo de acceso administrativo.

### Entidad propuesta `DataSubjectRequest`

- Titular.
- Tipo de solicitud.
- Consulta afectada.
- Estado.
- Fechas legales de respuesta.
- Estado de “reclamo en trámite”.
- Resolución y evidencia.

## Fase 5. Flujo previo a una consulta

La interfaz deberá seguir este orden:

1. Seleccionar el tipo de consulta.
2. Seleccionar la finalidad.
3. Escribir la justificación.
4. Mostrar el enlace para descargar la carta de autorización vigente.
5. Mostrar instrucciones para obtener la firma y conservar el documento.
6. Exigir declaraciones independientes y no premarcadas.
7. Mostrar las versiones de Términos, Política y Aviso aplicables.
8. Informar el costo.
9. Solicitar confirmación final antes de ejecutar y descontar el crédito.

### Declaraciones obligatorias propuestas

> Confirmo que cuento con una autorización firmada por la persona que será consultada,
> correspondiente a la finalidad indicada, y que puedo acreditarla cuando sea requerida.

> Confirmo que utilizaré el resultado exclusivamente para la finalidad declarada y que no lo
> publicaré, revenderé ni compartiré con personas no autorizadas.

> He leído y acepto los Términos y Condiciones y el Aviso de Privacidad vigentes.

La declaración deberá validarse tanto en frontend como en backend. El backend deberá exigir el
booleano estricto `true`; valores como la cadena `"false"`, `1` u otros valores verdaderos por
coerción deberán rechazarse.

### Componentes inicialmente afectados

- `Frond/src/Pages/NewQuery/NewQueryPage.jsx`
- `Frond/src/services/queriesApi.js`
- `Back/src/controllers/Query/postQuery.js`
- `Back/src/models/Querys.js`

## Fase 6. Reporte y lenguaje visible

Cada reporte deberá mostrar:

- Marca Verifik.
- Finalidad declarada.
- Fecha y hora de generación.
- Fecha de vigencia.
- Estado: completo, parcial, vencido, archivado o bajo reclamo.
- Fuentes consultadas.
- Fuentes fallidas.
- Advertencia de homónimos y coincidencias por nombre.
- Explicación de los niveles de hallazgo.
- Aviso de que Verifik no toma la decisión final.
- Canal de consultas y reclamos.

### Lenguaje permitido

- “Sin hallazgos en las fuentes que respondieron”.
- “Fuente no disponible al momento de la consulta”.
- “Coincidencia que requiere validación”.
- “Reporte correspondiente a la fecha y hora indicadas”.

### Lenguaje que se deberá evitar

- “Persona sin antecedentes”.
- “Persona culpable”.
- “No tiene registros” cuando una fuente no respondió.
- “Aprobado” o “rechazado”.
- “Información completamente actualizada”.
- “Certificación definitiva”.

### Componentes inicialmente afectados

- `Back/src/controllers/Query/getQueryResult.js`
- `Back/src/services/verifikReport.js`
- `Back/src/services/tusdatosReport.js`
- `Frond/src/Pages/QueryResult/QueryResultPage.jsx`

## Fase 7. Fuentes fallidas y recarga

La aplicación ya cuenta parcialmente con una ruta de recarga autenticada y una interfaz que
indica que el reintento no consume créditos. Antes de considerar completa la funcionalidad se
deberá:

- Confirmar contractualmente que el proveedor reconsulta solamente las fuentes fallidas.
- Conservar los resultados exitosos originales.
- Evitar que el reintento reemplace accidentalmente el reporte por metadatos incompletos.
- Guardar la fecha original y las fechas de recarga.
- Mostrar qué fuente se actualizó y cuándo.
- Limitar cantidad y frecuencia de reintentos.
- Auditar cada operación.
- Probar que nunca se descuenta un segundo crédito.

### Componentes inicialmente afectados

- `Back/src/controllers/Query/postQueryRetry.js`
- `Back/src/services/tusdatosApi.js`
- `Frond/src/Pages/QueryResult/QueryResultPage.jsx`

## Fase 8. Vigencia anual y retención de cinco años

### Ciclo propuesto

- Día 0: consulta vigente.
- Día 335: aviso de próxima pérdida de vigencia.
- Día 365: reporte vencido o histórico.
- El usuario podrá solicitar una nueva consulta.
- Antes de renovar deberá confirmar finalidad y autorización vigente.
- La renovación consumirá un nuevo crédito.
- Cada consulta conservará su propia fecha y plazo.
- A los cinco años se ejecutará la supresión o anonimización, salvo bloqueo legal documentado.

### Decisión pendiente de validación jurídica

Se deberá escoger formalmente una de estas opciones:

1. Conservar el reporte completo durante cinco años, cifrado y con acceso restringido.
2. Conservar el reporte completo durante doce meses y mantener únicamente trazabilidad y
   evidencia mínima durante los cuatro años restantes.

La segunda opción es inicialmente preferida por minimización, pero la decisión final requiere
validación jurídica y contractual.

### Componentes inicialmente afectados

- `Frond/src/Pages/Dashboard/DashboardPage.jsx`
- `Frond/src/Pages/History/HistoryPage.jsx`
- `Frond/src/components/QueryCard/QueryCard.jsx`
- Nuevo servicio de retención y notificaciones.
- Nuevo proceso programado de archivo y supresión.

## Fase 9. Seguridad previa al tratamiento adicional

Antes de incorporar nueva evidencia legal o ampliar la retención se deberá:

- Proteger `GET /User`.
- Eliminar o proteger el registro masivo de usuarios.
- Impedir que un usuario asigne su propio rol o estado.
- Evitar exposición de `password_hash`.
- Añadir limitación de solicitudes.
- Añadir cabeceras de seguridad.
- Reducir el límite global de cuerpos de 50 MB.
- Revisar el almacenamiento del JWT en `localStorage`.
- Añadir controles contra enumeración de usuarios.
- Auditar visualizaciones y descargas.
- Cifrar los resultados sensibles.
- Establecer rotación de secretos.
- Revisar CORS.
- Implementar autorización administrativa real.

Esta fase es un prerrequisito para el lanzamiento y no una mejora opcional.

## Fase 10. Pruebas y criterios de aceptación

Se deberán cubrir como mínimo los siguientes escenarios:

- No se crea una consulta sin finalidad.
- No se crea una consulta sin justificación.
- No se crea una consulta sin todas las declaraciones obligatorias.
- La cadena `"false"` no se acepta como autorización.
- Se guardan las versiones legales aceptadas.
- Un usuario no puede acceder a consultas ajenas.
- El reporte muestra fecha, finalidad y vigencia.
- Una fuente fallida nunca se presenta como “sin hallazgos”.
- La recarga no descuenta créditos.
- Solo se reintentan las fuentes fallidas.
- El reporte se marca vencido al cumplir doce meses.
- No existe renovación automática.
- La renovación vuelve a exigir finalidad y autorización.
- Se ejecuta archivo, supresión o anonimización al cumplir el plazo.
- La interfaz y las respuestas públicas no exponen la marca ni identificadores internos del
  proveedor.
- Los documentos legales cumplen la decisión final de transparencia.
- Las solicitudes de los titulares se tramitan dentro de los términos definidos.

## Orden recomendado de ejecución

1. Obtener acuerdo B2C, reventa y marca blanca.
2. Cerrar identidad, roles, canales y retención.
3. Corregir los tres documentos legales existentes.
4. Crear Términos, Política de Cookies y Aviso de Privacidad.
5. Corregir los riesgos críticos de seguridad.
6. Diseñar y aprobar migraciones y modelo de evidencia legal.
7. Implementar el flujo previo a la consulta.
8. Implementar advertencias y estados del reporte.
9. Implementar vigencia y renovación anual.
10. Implementar retención, archivo, supresión y bloqueos legales.
11. Implementar solicitudes de titulares.
12. Ejecutar pruebas y revisión jurídica final.

## Relación transversal con el código

Estos requisitos atraviesan el ciclo completo:

```text
NewQueryPage
  -> queriesApi
  -> QueryRoutes
  -> postQuery
  -> Query / QueryLegalEvidence
  -> ciclo de consulta del proveedor
  -> getQueryResult
  -> QueryResultPage / HistoryPage / DashboardPage
```

Por lo tanto, el cumplimiento no podrá resolverse agregando únicamente un checkbox. Deberá
existir correspondencia verificable entre los documentos publicados, la evidencia guardada, las
validaciones del backend, la interfaz, el reporte, el historial y los procesos de eliminación.

---

# Plan de mejora de la integración con la API de Tusdatos

## Alcance y estado de la revisión

Este bloque documenta la comparación realizada entre la especificación OpenAPI 3.1, versión
2.0.0, entregada por Tusdatos y la integración existente en Verifik.

La revisión fue de solo lectura. Al momento de realizarla:

- Se ejecutaron las 24 pruebas automatizadas existentes y todas finalizaron correctamente.
- No se realizaron solicitudes contra servicios reales o ambientes de producción.
- No se modificaron código, base de datos, configuración ni documentos legales.
- Los cambios descritos en este plan requieren aprobación específica antes de implementarse.

## Cobertura actual de la integración

Verifik utiliza actualmente los siguientes recursos del proveedor:

- Lanzamiento de consultas individuales mediante `POST /api/launch`.
- Lanzamiento de consultas de vehículos mediante `POST /api/launch/car`.
- Seguimiento de trabajos mediante `GET /api/results/{jobkey}`.
- Recarga de fuentes fallidas mediante `GET /api/retry/{id}` y
  `GET /api/retry_nit/{id}`.
- Recuperación del reporte estructurado mediante `GET /api/report_json/{id}`.
- Recepción del evento `individualCompleted` por webhook.

Actualmente no se utilizan las consultas por lote, OAuth 2.0, la administración automática de
tokens, los catálogos de fuentes y hallazgos, el monitoreo de PEP ni el webhook
`individualRetry`. Estas exclusiones no constituyen defectos mientras permanezcan fuera del
alcance funcional de Verifik.

## Controles correctamente implementados

- Las credenciales del proveedor permanecen en el backend.
- En producción se exige HTTPS para la URL del proveedor.
- Las solicitudes externas tienen tiempo máximo de espera.
- Existe una separación mínima de cinco segundos entre lanzamientos dentro de cada instancia.
- El primer sondeo se programa después de aproximadamente un minuto.
- El seguimiento utiliza backoff, límite de intentos y tiempo máximo inferior a la vigencia de
  dos horas documentada para el `jobid`.
- El estado del seguimiento se persiste para poder continuar después de reiniciar el proceso.
- Los reintegros de créditos son idempotentes.
- Las rutas de historial, estado, resultado y recarga verifican la propiedad de la consulta.
- El token del webhook se compara en tiempo constante.
- La recarga de fuentes no genera un nuevo movimiento de cobro.
- El historial no entrega al frontend el reporte completo del proveedor.
- La vista del reporte elimina URLs y varios metadatos internos.

## Hallazgos críticos

### 1. Fuente con error clasificada como “Sin hallazgos”

La documentación del proveedor establece que cada valor de `results` puede ser `true`, `false`
o `Error`. El código actual clasifica cualquier valor diferente de `true` como una fuente limpia.
Esto puede presentar una fuente fallida como “Sin hallazgos”.

Se deberá:

- Introducir estados explícitos: `finding`, `clear`, `error`, `unavailable` y `unknown`.
- No convertir valores desconocidos o de error en resultados favorables.
- Mantener separados el estado operativo de la fuente y la existencia de hallazgos.
- Añadir pruebas para valores booleanos, textos de error, valores nulos y respuestas parciales.

### 2. Riesgo desconocido presentado como riesgo bajo

El backend contempla el nivel `unknown`, pero la interfaz representa como “Riesgo bajo” todo
valor que no sea `high` o `medium`. La incertidumbre no puede convertirse en una conclusión
favorable.

Se deberá:

- Mostrar `unknown` como “Sin clasificación” o “Requiere revisión”.
- Mantener diferenciados “sin hallazgos”, “sin información suficiente” y “fuente fallida”.
- Evitar que la interfaz utilice un nivel por defecto que altere el resultado.

## Hallazgos de prioridad alta

### 1. Confirmación de autorización no estricta

El backend evalúa actualmente el campo `consent_given` por veracidad general. Esto permite que
valores como la cadena `"false"` o el número `1` superen la validación.

Se deberá exigir `consent_given === true` y complementar la evidencia con finalidad,
justificación, versiones legales y fecha de aceptación, de acuerdo con el plan legal consolidado.

### 2. Endurecimiento del webhook

Aunque existe autenticación Bearer y comparación segura del secreto, el receptor no valida
formalmente el esquema del evento ni comprueba suficientemente la relación entre la consulta y
el `reportId` recibido.

Se deberá:

- Validar tipos, tamaños, formatos y campos permitidos.
- Exigir una referencia interna con formato válido.
- Validar `reportId` y `finished_at`.
- Comprobar que el reporte corresponda al tipo y documento esperados antes de completar la
  consulta.
- Aplicar límites de tamaño y frecuencia específicos para el webhook.
- Incorporar detección de eventos repetidos mediante identificador o hash.
- Documentar y probar la configuración `BearerAuth` registrada ante el proveedor.

### 3. Conservación del reporte completo

La respuesta JSON completa se almacena en `provider_response` sin que todavía existan procesos
de cifrado de campo, archivo, anonimización o eliminación.

Se deberá coordinar esta corrección con la decisión jurídica pendiente sobre conservación:

- Reporte completo durante doce meses y trazabilidad mínima durante cinco años; o
- Reporte completo durante cinco años bajo una justificación jurídica expresa, cifrado y acceso
  restringido.

### 4. Sustitución indiscriminada de la marca del proveedor

El código reemplaza el nombre del proveedor por “Verifik” dentro de cualquier texto visible.
Esto puede transformar una frase como “Validado por el proveedor” en una atribución materialmente
distinta.

Se deberá:

- Mantener inmutable el texto original en el registro interno.
- Separar marca de la interfaz, fuente oficial y proveedor técnico.
- Aplicar etiquetas de presentación controladas, en vez de alterar textos probatorios.
- Confirmar contractualmente el alcance de marca blanca y transformación de reportes.

## Hallazgos de prioridad media

- La recarga reemplaza temporalmente el reporte anterior y no conserva fechas por fuente.
- No existe límite de frecuencia o cantidad de recargas por usuario.
- La separación de cinco segundos entre lanzamientos funciona solo dentro de una instancia Node.
- Errores de autenticación del proveedor pueden tratarse como transitorios y repetirse durante el
  periodo de seguimiento.
- No existe una política específica para `429` ni procesamiento de `Retry-After`.
- El cliente de PDF no distingue correctamente una respuesta `202` con JSON de un PDF terminado.
- La validación de documentos y fechas en el backend es insuficiente.
- Las respuestas de historial pueden conservar identificadores y nombres internos del proveedor.
- El límite global de los cuerpos HTTP es de 50 MB, excesivo para consultas y webhooks.
- La idempotencia se basa en una ventana temporal y no en una clave única persistida.
- No existe todavía un historial completo y versionado de migraciones de base de datos.

## Deficiencias detectadas en la especificación OpenAPI externa

Estas observaciones corresponden a la documentación del proveedor y no deberán interpretarse
automáticamente como defectos de Verifik:

- No se declara la colección `servers`.
- Algunas rutas incluyen incorrectamente parámetros de consulta dentro del path.
- Solo se declara `HTTPBasic`, aunque la documentación describe Bearer y OAuth 2.0.
- La revocación de tokens describe Bearer, pero declara Basic en `security`.
- El reporte JSON no tiene un esquema formal.
- Existen propiedades mal escritas como `min_lenght` y `max_lenght`.
- El reporte HTML declara un tipo de contenido inconsistente.
- Varias respuestas no tienen esquemas verificables.
- Los ejemplos de webhooks no definen por sí mismos la autenticación real de entrega.

No se deberá generar automáticamente un cliente de producción a partir de esta especificación sin
una capa de corrección, validación y pruebas de contrato.

## Plan de implementación

### Fase API 1. Corregir exactitud y presentación

- Implementar los estados explícitos de fuente.
- Corregir la representación de riesgos desconocidos.
- Normalizar hallazgos utilizando el campo estable `codigo`.
- Conservar por separado código, descripción, fuente, coincidencia y categoría.
- Añadir pruebas de reportes parciales, fuentes fallidas y categorías desconocidas.

### Fase API 2. Crear un contrato interno robusto

- Crear validadores para lanzamiento, progreso, resultado, reporte y recarga.
- Normalizar las variantes de respuesta en tipos internos estables.
- Definir el tratamiento de `200`, `202`, `207`, `400`, `401`, `403`, `404`, `422`, `429` y
  errores `5xx`.
- Procesar `Retry-After` cuando corresponda.
- Tratar errores de autenticación como incidentes de configuración.
- Preparar pruebas de contrato con respuestas anonimizadas.
- Confirmar con el proveedor la autenticación permitida en cada endpoint.

### Fase API 3. Proteger el webhook

- Aplicar validación estricta y límite de tamaño al cuerpo.
- Verificar la asociación entre consulta, referencia y reporte.
- Añadir limitación de solicitudes.
- Registrar eventos procesados para evitar repeticiones.
- Probar eventos válidos, inválidos, duplicados, tardíos y manipulados.

### Fase API 4. Hacer seguras las recargas

- Conservar el reporte anterior hasta que la recarga finalice correctamente.
- Registrar cada recarga como un evento independiente.
- Mantener la fecha original y la fecha de actualización de cada fuente.
- Limitar frecuencia y número de intentos.
- Evaluar el webhook `individualRetry`.
- Probar que ninguna recarga descuente créditos.

### Fase API 5. Integrar privacidad y evidencia legal

- Exigir booleanos estrictos en las declaraciones legales.
- Incorporar finalidad, justificación y versiones aceptadas.
- Separar resultado completo, resumen, evidencia legal y auditoría de accesos.
- Implementar cifrado, archivo y supresión según la decisión de retención.
- Eliminar metadatos internos de las respuestas públicas.
- Conservar internamente la procedencia real sin alterar el contenido original.

### Fase API 6. Preparar escalabilidad y operación

- Sustituir la cola en memoria por una cola o limitador distribuido antes de ejecutar varias
  instancias.
- Definir rotación y verificación de tokens del proveedor.
- Añadir comprobaciones operativas que no expongan secretos.
- Añadir métricas para autenticación fallida, límites de frecuencia, fuentes fallidas, reportes
  demorados y webhooks rechazados.

### Fase API 7. Pruebas de aceptación

- Pruebas unitarias del adaptador externo.
- Pruebas de autenticación y propiedad de consultas.
- Pruebas del webhook y sus repeticiones.
- Pruebas de concurrencia e idempotencia.
- Pruebas de preservación del reporte durante una recarga.
- Pruebas de minimización de respuestas públicas.
- Pruebas de migraciones y reversión.
- Pruebas integrales contra el sandbox utilizando únicamente identidades de prueba.

## Orden de prioridad recomendado

1. Corregir la clasificación de fuentes con error.
2. Corregir la presentación del nivel `unknown`.
3. Exigir autorización estrictamente booleana.
4. Proteger y validar el webhook.
5. Preservar correctamente el reporte durante las recargas.
6. Definir el contrato interno y la política de errores HTTP.
7. Aplicar minimización, cifrado y retención.
8. Preparar la operación con múltiples instancias.
9. Completar las pruebas de contrato e integración.

## Criterio de cierre

La integración se considerará preparada para producción B2C cuando:

- Ningún error o estado desconocido pueda presentarse como resultado favorable.
- Toda consulta tenga evidencia legal verificable.
- El webhook no pueda completar consultas con datos no validados.
- Las recargas conserven la historia y no generen cobros adicionales.
- Los resultados se conserven, archiven y eliminen según la política aprobada.
- Las respuestas públicas no expongan secretos ni metadatos internos.
- El adaptador del proveedor cuente con pruebas de contrato suficientes.
- La operación multiinstancia respete los límites del proveedor.
