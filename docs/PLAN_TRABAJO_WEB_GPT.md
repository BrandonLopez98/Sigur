# Plan de trabajo desde ChatGPT Web

## Propósito

Este plan reúne las actividades de mejora de Verifik que pueden realizarse únicamente desde la
versión web de ChatGPT, sin utilizar IDE, terminal, Node.js, base de datos ni acceso directo al
repositorio.

Los resultados de este plan serán documentos, decisiones, matrices, textos, casos de prueba y
backlog. Su producción no demuestra por sí misma que el código cumpla los requisitos. La
verificación e implementación técnica se realizará mediante el Plan de Implementación de Código
hasta Producción.

## Reglas de seguridad y confidencialidad

1. Trabajar exclusivamente con información del proyecto personal Verifik.
2. No copiar información, documentos, código, credenciales ni datos relacionados con Cafam.
3. No ingresar contraseñas, tokens, variables de entorno o datos personales reales.
4. Anonimizar documentos, identificaciones, nombres, correos y respuestas de APIs.
5. Confirmar que las políticas corporativas permiten utilizar ChatGPT Web para estas actividades.
6. Tratar las respuestas jurídicas como borradores sujetos a revisión de un abogado colombiano.
7. Solicitar los entregables en Markdown para incorporarlos posteriormente al repositorio.
8. Identificar cada documento con versión, fecha, estado y responsable de aprobación.

## Forma de trabajo recomendada

Cada actividad deberá producir un entregable autocontenido con:

- Objetivo.
- Contexto utilizado.
- Decisiones confirmadas.
- Supuestos pendientes.
- Contenido propuesto.
- Riesgos o dudas.
- Criterios de aceptación.
- Versión y fecha.
- Estado: borrador, en revisión o aprobado.

No se deberán mezclar decisiones aprobadas con propuestas de ChatGPT. Toda inferencia deberá
marcarse expresamente como pendiente de validación.

## WEB-01. Registro de decisiones pendientes

Preparar una matriz que resuelva:

- Identidad jurídica del operador de Verifik.
- Canales de atención y habeas data.
- Roles de responsable, encargado, usuario y proveedor.
- Autorización contractual para B2C, reventa y marca blanca.
- Conservación del reporte completo durante uno o cinco años.
- Conservación de metadatos y evidencia durante cinco años.
- Tratamiento de supresión, reclamos y bloqueos legales.
- Categorías de datos que Verifik no debe consultar o mostrar.
- Reglas especiales para información financiera, laboral y de menores.
- Grado de identificación pública de proveedores tecnológicos.

### Entregable

`MATRIZ_DECISIONES_LEGALES.md`

### Criterio de cierre

Cada decisión tiene responsable, fundamento, estado y fecha objetivo. Las decisiones que bloquean
la implementación están claramente identificadas.

## WEB-02. Documentación legal

Preparar borradores coherentes entre sí de:

- Términos y Condiciones B2C.
- Política de Tratamiento de Datos Personales.
- Aviso de Privacidad corto.
- Modelo de autorización firmada.
- Aviso legal del reporte.
- Política de cookies.
- Política de uso aceptable.
- Política de retracto, cancelación y devoluciones.
- Procedimiento de consultas y reclamos.
- Procedimiento de incidentes de seguridad.
- Tabla de retención, archivo, anonimización y eliminación.

Cada documento deberá incluir versión, fecha, responsable de aprobación y relación con los demás
documentos. Los textos deberán mantener consistencia sobre finalidad, vigencia, conservación,
fuentes fallidas, homónimos, responsabilidad del usuario y derechos del titular.

### Entregable

Carpeta lógica `documentos-legales/`, inicialmente generada como respuestas Markdown separadas.

### Criterio de cierre

Los documentos no contienen contradicciones entre sí y están listos para revisión jurídica
profesional.

## WEB-03. Catálogo de finalidades

Desarrollar el catálogo inicial de finalidades:

- Arrendamiento.
- Codeudor, fiador o garante.
- Empleo doméstico o personal de aseo.
- Servicios independientes de aseo.
- Cuidado de personas.
- Conductor particular.
- Servicios dentro del hogar.
- Contratista independiente.
- Administración, vigilancia o portería.
- Transacción de vehículos.
- Contrato entre particulares.
- Otra relación contractual legítima.

Para cada finalidad se deberá definir:

- Código estable.
- Nombre visible.
- Descripción.
- Datos razonablemente necesarios.
- Usos permitidos.
- Usos prohibidos.
- Texto de autorización.
- Advertencia aplicable.
- Plazo de vigencia.
- Casos que requieran revisión adicional.

### Entregable

`CATALOGO_FINALIDADES.md`

### Criterio de cierre

Cada finalidad tiene un código reutilizable por documentos, base de datos, API e interfaz.

## WEB-04. Diseño funcional y experiencia de usuario

Diseñar en texto los flujos de:

- Registro e inicio de sesión.
- Compra de créditos.
- Nueva consulta.
- Descarga de la carta de autorización.
- Selección de finalidad.
- Justificación obligatoria.
- Declaraciones y aceptación legal.
- Confirmación del cobro.
- Consulta en proceso.
- Resultado completo o parcial.
- Fuentes no disponibles.
- Homónimos y coincidencias por nombre.
- Recarga gratuita.
- Reporte próximo a vencer.
- Nueva consulta anual.
- Solicitud de habeas data.

Para cada pantalla se deberán redactar títulos, ayudas, advertencias, confirmaciones, estados
vacíos, errores y mensajes de éxito. Los textos evitarán conclusiones como “sin antecedentes”,
“aprobado”, “rechazado” o “información completamente actualizada”.

### Entregable

`FLUJOS_UX_Y_CONTENIDO.md`

### Criterio de cierre

Cada flujo tiene entrada, decisiones, estados, mensajes y resultado claramente descritos.

## WEB-05. Matrices funcionales y de seguridad

Elaborar:

- Matriz de roles y permisos.
- Matriz de rutas esperadas.
- Matriz de datos personales.
- Matriz de proveedores.
- Matriz de fuentes consultadas.
- Modelo de amenazas.
- Matriz de riesgos y controles.
- Evaluación de impacto de privacidad.
- Inventario de decisiones automatizadas y riesgos de discriminación.

### Entregable

`MATRICES_CUMPLIMIENTO_Y_SEGURIDAD.md`

### Criterio de cierre

Cada riesgo tiene propietario, impacto, probabilidad, control esperado y evidencia necesaria.

## WEB-06. Diseño de pruebas

Crear escenarios Given/When/Then para:

- Autorización y finalidad.
- Consultas propias y ajenas.
- Entradas inválidas.
- Fuentes con hallazgos, sin hallazgos y con error.
- Riesgo desconocido.
- Homónimos.
- Recargas y créditos.
- Webhooks válidos, manipulados y repetidos.
- Reportes vencidos.
- Renovación anual.
- Retención y eliminación.
- Pagos y webhooks de Wompi.
- Recuperación de cuenta.
- Roles administrativos.

Cada caso deberá indicar precondiciones, datos anonimizados, pasos, resultado esperado y evidencia
que deberá conservarse.

### Entregable

`PLAN_PRUEBAS_ACEPTACION.md`

### Criterio de cierre

Los escenarios cubren caminos positivos, negativos, límites, abuso y recuperación ante fallos.

## WEB-07. Operación y soporte

Redactar procedimientos para:

- Caída de Tusdatos.
- Fuente pública no disponible.
- Pago aprobado no acreditado.
- Consulta cobrada que no finaliza.
- Token comprometido.
- Incidente de datos personales.
- Solicitud de rectificación o supresión.
- Reclamo en trámite.
- Recuperación de respaldos.
- Comunicación al usuario.
- Escalamiento al proveedor.

### Entregable

`RUNBOOK_OPERACION_Y_SOPORTE.md`

### Criterio de cierre

Cada incidente define responsable, prioridad, diagnóstico, acciones permitidas, comunicación,
evidencia y condición de cierre.

## WEB-08. Preparación comercial y contractual

Preparar:

- Preguntas contractuales para Tusdatos.
- Solicitud formal de autorización B2C y marca blanca.
- Lista de confirmaciones sobre reventa.
- Preguntas sobre retención y eliminación.
- Propuesta de acuerdo de niveles de servicio.
- Responsabilidad por fuentes caídas.
- Uso permitido del reporte transformado.
- Atención conjunta de reclamos y derechos de titulares.
- Procedimiento de terminación y devolución o eliminación de información.

### Entregable

`CUESTIONARIO_PROVEEDOR.md`

### Criterio de cierre

Las respuestas del proveedor permiten determinar si el modelo comercial y técnico de Verifik es
contractualmente viable.

## WEB-09. Backlog para implementación

Convertir los documentos anteriores en historias de usuario que incluyan:

- Objetivo.
- Dependencias.
- Criterios de aceptación.
- Casos negativos.
- Evidencia requerida.
- Prioridad.
- Riesgo legal o técnico.
- Referencia al documento de origen.

### Entregable

`BACKLOG_APROBADO.md`

### Criterio de cierre

Cada historia puede asignarse al plan técnico sin depender de interpretaciones adicionales.

## Lo que ChatGPT Web no puede certificar

Desde la web no se podrá confirmar:

- Que el código cumple el documento.
- Que una vulnerabilidad fue corregida.
- Que una migración es segura.
- Que los tests pasan.
- Que el sistema funciona en producción.
- Que no se exponen datos o secretos.
- Que los respaldos se pueden restaurar.
- Que un documento tiene aprobación jurídica definitiva.

Estos puntos deberán pasar obligatoriamente al Plan de Implementación de Código hasta Producción.

## Orden recomendado

1. Completar la matriz de decisiones legales.
2. Preparar el cuestionario para el proveedor.
3. Cerrar el catálogo de finalidades.
4. Redactar y armonizar los documentos legales.
5. Diseñar los flujos y contenidos de la interfaz.
6. Elaborar las matrices de seguridad y privacidad.
7. Diseñar las pruebas de aceptación.
8. Redactar los procedimientos de operación.
9. Convertir todo en backlog aprobado.

## Criterio de finalización

Este plan se considerará terminado cuando todos los entregables estén versionados, revisados y
convertidos en requisitos verificables para el plan de código. La finalización de este trabajo no
autoriza automáticamente cambios técnicos ni puesta en producción.
