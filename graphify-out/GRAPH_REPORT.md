# Graph Report - Sigur  (2026-09-30)

## Corpus Check
- 9 files · ~34,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 709 nodes · 1094 edges · 53 communities (44 shown, 9 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.87)
- Token cost: 1,147 input · 2,924 output

## Community Hubs (Navigation)
- Dependencias del backend
- Reportes y resultados Tusdatos
- Dependencias del frontend
- Rutas y filtros consultas
- Cliente y recargas Tusdatos
- Modelos y creación de datos
- Pagos y Wompi
- Paquetes y perfiles
- Usuarios y autenticación
- Enrutamiento de API
- Ciclo de vida Tusdatos
- Documentación operativa
- Aplicación frontend
- Arranque del backend
- Herramientas y runtime
- Historial y filtros
- Visualización de resultados
- Seguridad de autenticación
- Créditos e historial UI
- Créditos y observabilidad
- Cuenta y sesión
- Salud y autorización
- Creación de consultas
- Planes y decisiones
- Base de datos y usuarios
- Observabilidad del backend
- Robustez integración Tusdatos
- Webhooks y movimientos
- Procesamiento de resultados Tusdatos
- Cumplimiento B2C
- Compra de paquetes
- Reintentos y backoff
- Historial de transacciones
- Nueva consulta
- Normalización Tusdatos
- Prioridades técnicas
- Iconos sociales
- Operación e idempotencia
- Identidad visual
- Ilustración de arquitectura
- Login frontend
- Monitor de Tusdatos
- Retención de datos
- Consultas reutilizadas
- Entrada HTML frontend
- Movimiento de créditos externo
- Reembolso de consulta externo
- Resultado Tusdatos externo
- Reporte HTML externo
- Configuración Tusdatos externa
- Errores Tusdatos externos
- Lanzamiento Tusdatos externo
- Consulta vehicular externa

## God Nodes (most connected - your core abstractions)
1. `App()` - 21 edges
2. `incrementMetric()` - 15 edges
3. `logEvent()` - 14 edges
4. `synchronizeTusdatosQuery()` - 14 edges
5. `react` - 14 edges
6. `QueryResultPage()` - 13 edges
7. `Plan técnico hasta producción` - 13 edges
8. `AccountPage()` - 12 edges
9. `requestTusdatos()` - 12 edges
10. `Plan de trabajo desde ChatGPT Web` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Normalización de respuestas de lanzamiento` --semantically_similar_to--> `Contrato interno robusto de Tusdatos`  [INFERRED] [semantically similar]
  graphify-out/memory/query_20260927_221220_03bef208_perfecto_que_otros_cambios_recomiendas_realizar.md → docs/PLAN_AUDITORIA_Y_APRENDIZAJE.md
- `Lease de monitor distribuido` --semantically_similar_to--> `CODE-12 Escalabilidad y operación`  [INFERRED] [semantically similar]
  graphify-out/memory/query_20260927_224012_c2ea1a63_perfecto_como_ya_terminamos_la_prioridad_inmedita.md → docs/PLAN_IMPLEMENTACION_CODIGO_PRODUCCION.md
- `Secure Backend Environment Configuration` --semantically_similar_to--> `Secret and Personal Data Hygiene`  [INFERRED] [semantically similar]
  Back/README.md → README.md
- `Versioned and Reversible Migrations` --semantically_similar_to--> `CODE-00B Migration and Rollback Plan`  [INFERRED] [semantically similar]
  Back/README.md → README.md
- `Demo Data Production Guard` --semantically_similar_to--> `Fictitious Demo Data Policy`  [INFERRED] [semantically similar]
  Back/README.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Planes coordinados de Verifik** — docs_plan_auditoria_y_aprendizaje_plan_auditoria, docs_plan_trabajo_web_gpt_plan_web_gpt, docs_plan_implementacion_codigo_produccion_plan_tecnico_produccion [EXTRACTED 1.00]
- **Trazabilidad legal del ciclo de consulta** — docs_plan_auditoria_y_aprendizaje_catalogo_finalidades, docs_plan_auditoria_y_aprendizaje_modelo_evidencia_legal, docs_plan_auditoria_y_aprendizaje_flujo_preconsulta, docs_plan_auditoria_y_aprendizaje_reporte_verifik, docs_plan_auditoria_y_aprendizaje_vigencia_retencion [EXTRACTED 1.00]
- **Robustez operativa de Tusdatos** — graphify_out_memory_query_20260927_221220_03bef208_perfecto_que_otros_cambios_recomiendas_realizar_normalizacion_lanzamiento, graphify_out_memory_query_20260927_222605_f405647e_ok_realiza_todos_los_cambios_de_prioridad_inmediat_polling_finito, graphify_out_memory_query_20260927_224012_c2ea1a63_perfecto_como_ya_terminamos_la_prioridad_inmedita_lease_monitor_distribuido, graphify_out_memory_query_20260927_224012_c2ea1a63_perfecto_como_ya_terminamos_la_prioridad_inmedita_observabilidad_tusdatos [INFERRED 0.85]
- **Layered Hero Composition** — frond_src_assets_hero_upper_floating_panel, frond_src_assets_hero_lower_purple_platform, frond_src_assets_hero_vertical_separation_guides [INFERRED 0.95]
- **Verifik Backend and Frontend Documentation Set** — readme_verifik, back_readme_backend_de_verifik, frond_readme_frontend_de_verifik [EXTRACTED 1.00]
- **Production and Data Safety Controls** — back_readme_secure_environment_configuration, back_readme_destructive_sync_guard, back_readme_demo_data_guard, frond_readme_vite_public_environment_variables, readme_secret_and_personal_data_hygiene, readme_fictitious_demo_data_policy [INFERRED 0.85]
- **CODE-00B Schema Change Safety** — back_readme_versioned_reversible_migrations, back_readme_destructive_sync_guard, readme_code_00b_migration_and_rollback_plan [INFERRED 0.95]

## Communities (53 total, 9 thin omitted)

### Community 0 - "Dependencias del backend"
Cohesion: 0.05
Nodes (45): author, dependencies, bcryptjs, body-parser, cookie-parser, cors, dotenv, express (+37 more)

### Community 1 - "Reportes y resultados Tusdatos"
Cohesion: 0.07
Nodes (31): { buildVerifikReport }, { getTusdatosReportJson }, { Query }, buildSourceIndex(), buildVerifikReport(), countRecords(), humanizeKey(), isEmpty() (+23 more)

### Community 2 - "Dependencias del frontend"
Cohesion: 0.06
Nodes (35): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+27 more)

### Community 3 - "Rutas y filtros consultas"
Cohesion: 0.06
Nodes (26): filterByDateRange, filterByDocumentType, filterByNameOrDocument, filterByRiskLevel, filterByStatus, { Query }, { Query }, { serializeQueryProgress } (+18 more)

### Community 4 - "Cliente y recargas Tusdatos"
Cohesion: 0.10
Nodes (27): {
  getTusdatosQueryResult,
}, POLL_INTERVAL_MS, { Query }, RETRY_SUPPORTED_TYPES, { retryTusdatosQuery }, ALLOWED_DOCUMENT_TYPES, {
  launchTusdatosQuery,
}, createProviderError() (+19 more)

### Community 5 - "Modelos y creación de datos"
Cohesion: 0.08
Nodes (16): { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, buildDuplicateQueryWhere() (+8 more)

### Community 6 - "Pagos y Wompi"
Cohesion: 0.11
Nodes (17): { PaymentTransaction, CreditPackage }, { CreditPackage, PaymentTransaction }, crypto, { applyCreditMovement }, {
  conn,
  PaymentTransaction,
}, crypto, getNestedValue(), hasSameChecksum() (+9 more)

### Community 7 - "Paquetes y perfiles"
Cohesion: 0.10
Nodes (13): verifikServiceInfo, { CreditPackage }, verifikServiceInfo, { CreditPackage, conn }, { CreditPackage, conn }, back_src_db_creditpackage, authenticateToken, authorizeRoles (+5 more)

### Community 8 - "Usuarios y autenticación"
Cohesion: 0.12
Nodes (14): { User, UserProfile, CreditWallet }, bcrypt, { User }, { UserProfile, conn }, { Query, User }, bcrypt, { User, CreditWallet, conn }, bcrypt (+6 more)

### Community 9 - "Enrutamiento de API"
Cohesion: 0.10
Nodes (18): authenticateToken, creditRoutes, getMyCreditMovements, { Router }, authRoutes, creditRoutes, healthRoutes, packageRoutes (+10 more)

### Community 10 - "Ciclo de vida Tusdatos"
Cohesion: 0.10
Nodes (20): { buildResultSummary, getRiskLevel }, {
  classifyTusdatosLaunchResponse,
  getStoredTusdatosReportId,
  normalizeProviderStatus,
}, {
  getMaxPollAttempts,
  getMonitorLeaseMs,
  getPollBackoffMs,
}, getNextPollDate(), {
  getTusdatosQueryResult,
  getTusdatosReportJson,
  hasTusdatosConfiguration,
  isTerminalTusdatosError,
}, { incrementMetric, logEvent }, inFlightQueries, INITIAL_DELAY_MS (+12 more)

### Community 11 - "Documentación operativa"
Cohesion: 0.13
Nodes (20): Backend de Verifik, Node.js, Express, Sequelize and PostgreSQL Backend Stack, Demo Data Production Guard, Destructive Database Sync Guard, PostgreSQL 15.x Baseline, Secure Backend Environment Configuration, Versioned and Reversible Migrations, Frontend de Verifik (+12 more)

### Community 12 - "Aplicación frontend"
Cohesion: 0.14
Nodes (11): App(), getSavedSession(), getInitials(), links, Navbar(), faqGroups, HelpPage(), tutorials (+3 more)

### Community 13 - "Arranque del backend"
Cohesion: 0.12
Nodes (16): { conn, User, CreditPackage }, { getTusdatosConfig }, loadCreditPackages(), loadData(), server, startServer(), { startTusdatosQueryMonitor }, back_json_creditpackages (+8 more)

### Community 14 - "Herramientas y runtime"
Cohesion: 0.11
Nodes (18): dependencies, @openai/codex, engines, node, npm, name, packageManager, private (+10 more)

### Community 15 - "Historial y filtros"
Cohesion: 0.16
Nodes (12): DOCUMENT_TYPES, FilterGroup(), FilterPanel(), RISK_OPTIONS, STATUS_OPTIONS, formatDate(), QueryCard(), HistoryPage() (+4 more)

### Community 16 - "Visualización de resultados"
Cohesion: 0.24
Nodes (16): DataTable(), formatDateTime(), formatSourceName(), formatValue(), GROUPS, isPrimitive(), QueryResultPage(), handleRetry() (+8 more)

### Community 17 - "Seguridad de autenticación"
Cohesion: 0.13
Nodes (12): bcrypt, jwt, { User }, jwt, authenticateToken, express, getCurrentUser, login (+4 more)

### Community 18 - "Créditos e historial UI"
Cohesion: 0.24
Nodes (13): CreditMovementsPage(), handleLoadMore(), loadMovements(), formatAmount(), formatDateTime(), getMovementReference(), MOVEMENT_CONFIG, DashboardPage() (+5 more)

### Community 19 - "Créditos y observabilidad"
Cohesion: 0.20
Nodes (13): applyCreditMovement(), createHttpError(), { CreditWallet, CreditMovement }, { incrementMetric, logEvent }, validateMovement(), logEvent(), { applyCreditMovement }, createRefundQueryCredit() (+5 more)

### Community 20 - "Cuenta y sesión"
Cohesion: 0.24
Nodes (11): handleQueryCreated(), loadCurrentUser(), AccountPage(), handlePasswordSubmit(), handleProfileSubmit(), loadUser(), formatDate(), getInitials() (+3 more)

### Community 21 - "Salud y autorización"
Cohesion: 0.19
Nodes (9): getHealth(), getHealthMetrics(), { getMetricsSnapshot }, authenticateToken, authorizeRoles, { getHealth, getHealthMetrics }, healthRoutes, { Router } (+1 more)

### Community 22 - "Creación de consultas"
Cohesion: 0.18
Nodes (12): { applyCreditMovement }, createHttpError(), DOCUMENT_TYPES, {
  findRecentDuplicateQuery,
  markAsIdempotentReplay,
}, formatTusdatosIssueDate(), { incrementMetric, logEvent }, {
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
}, { Query, User, conn } (+4 more)

### Community 23 - "Planes y decisiones"
Cohesion: 0.17
Nodes (13): Aprobación previa de cambios, Matriz de seguridad de rutas, Plan de auditoría y aprendizaje, WEB-09 Backlog aprobado, Seguridad y confidencialidad en ChatGPT Web, WEB-08 Cuestionario al proveedor, WEB-01 Matriz de decisiones legales, WEB-02 Documentación legal (+5 more)

### Community 24 - "Base de datos y usuarios"
Cohesion: 0.17
Nodes (10): { User }, basename, capsEntries, entries, fs, modelDefiners, path, { Sequelize } (+2 more)

### Community 25 - "Observabilidad del backend"
Cohesion: 0.18
Nodes (10): { AsyncLocalStorage }, logContext, metrics, observeDuration(), runWithLogContext(), sanitize(), assert, { sanitize } (+2 more)

### Community 26 - "Robustez integración Tusdatos"
Cohesion: 0.18
Nodes (11): Contrato interno robusto de Tusdatos, Estados explícitos de fuente, Plan de mejora de la integración con Tusdatos, Webhook seguro de Tusdatos, CODE-04 Adaptador robusto de Tusdatos, Normalización de respuestas de lanzamiento, Recomendaciones priorizadas para Tusdatos, Reconciliador de consultas huérfanas (+3 more)

### Community 27 - "Webhooks y movimientos"
Cohesion: 0.20
Nodes (6): { CreditMovement, Query }, crypto, { Query }, { synchronizeTusdatosQuery }, back_src_db_creditmovement, back_src_db_query

### Community 28 - "Procesamiento de resultados Tusdatos"
Cohesion: 0.27
Nodes (8): getTusdatosReportJson(), completeQuery(), registerTusdatosLaunchResponse(), buildResultSummary(), getRiskLevel(), assert, { buildResultSummary, getRiskLevel }, test

### Community 29 - "Cumplimiento B2C"
Cohesion: 0.20
Nodes (10): Catálogo cerrado de finalidades, Plan consolidado de cumplimiento legal, Flujo previo a una consulta, Modelo de evidencia legal, Operación B2C y marca blanca, Reporte Verifik, Seguridad previa al tratamiento adicional, CODE-06 Modelo de evidencia legal (+2 more)

### Community 30 - "Compra de paquetes"
Cohesion: 0.38
Nodes (7): formatCurrency(), openWompiCheckout(), PackagesPage(), handleBuyPackage(), loadPackages(), getPackages(), createPaymentCheckout()

### Community 31 - "Reintentos y backoff"
Cohesion: 0.39
Nodes (7): getMaxPollAttempts(), getMonitorLeaseMs(), getPollBackoffMs(), readPositiveNumber(), assert, {
  getMaxPollAttempts,
  getMonitorLeaseMs,
  getPollBackoffMs,
}, test

### Community 32 - "Historial de transacciones"
Cohesion: 0.42
Nodes (7): formatCurrency(), formatDateTime(), formatPaymentMethod(), getStatusLabel(), TransactionsPage(), loadTransactions(), getMyPaymentTransactions()

### Community 33 - "Nueva consulta"
Cohesion: 0.39
Nodes (5): CONSULTATION_TYPES, NewQueryPage(), handleSubmit(), createQuery(), createRequestId()

### Community 34 - "Normalización Tusdatos"
Cohesion: 0.48
Nodes (6): isTerminalTusdatosError(), synchronizeTusdatosQuery(), classifyTusdatosLaunchResponse(), firstNonEmptyString(), getStoredTusdatosReportId(), normalizeProviderStatus()

### Community 35 - "Prioridades técnicas"
Cohesion: 0.29
Nodes (7): Recarga de fuentes fallidas, CODE-13 Calidad y CI/CD, Ciclo de entrega aprobada, CODE-01 Exactitud de resultados, Plan técnico hasta producción, CODE-09 Recarga de fuentes, CODE-02 Seguridad inmediata de la API

### Community 36 - "Iconos sociales"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation and Code Icon, GitHub Icon, Icon Sprite Sheet, Social Profile Badge Icon, X Social Platform Icon

### Community 37 - "Operación e idempotencia"
Cohesion: 0.33
Nodes (6): CODE-12 Escalabilidad y operación, CODE-11 Pagos y créditos, Idempotencia de consultas y créditos, Implementación de prioridad alta, Lease de monitor distribuido, Observabilidad de la integración Tusdatos

### Community 38 - "Identidad visual"
Cohesion: 0.50
Nodes (5): Lightning-Shaped Alpha Mask, Purple Lightning Bolt Favicon, Gaussian Blur Highlight Filters, Lightning Bolt Symbol, Purple and Blue Glow Treatment

### Community 39 - "Ilustración de arquitectura"
Cohesion: 0.60
Nodes (5): Layered architecture concept, Layered platform illustration, Lower purple-edged rounded platform, Upper floating rounded rectangular panel, Dotted vertical separation guides

### Community 40 - "Login frontend"
Cohesion: 0.70
Nodes (3): LoginPage(), handleSubmit(), login()

### Community 41 - "Monitor de Tusdatos"
Cohesion: 0.83
Nodes (4): incrementMetric(), hasTusdatosConfiguration(), runTusdatosMonitor(), startTusdatosQueryMonitor()

### Community 42 - "Retención de datos"
Cohesion: 0.67
Nodes (3): Minimización en la retención, Vigencia anual y retención quinquenal, CODE-10 Vigencia, renovación y retención

### Community 43 - "Consultas reutilizadas"
Cohesion: 0.67
Nodes (3): Consulta processing huérfana, Diagnóstico de consultas reutilizadas de Tusdatos, Respuesta reutilizada sin jobid

## Knowledge Gaps
- **308 isolated node(s):** `assert`, `{ sanitize }`, `test`, `assert`, `{ createRefundQueryCredit }` (+303 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 380 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sequelize` connect `Modelos y creación de datos` to `Dependencias del backend`, `Base de datos y usuarios`, `Ciclo de vida Tusdatos`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `express` connect `Enrutamiento de API` to `Dependencias del backend`, `Rutas y filtros consultas`, `Pagos y Wompi`, `Paquetes y perfiles`, `Seguridad de autenticación`, `Salud y autorización`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `react` connect `Aplicación frontend` to `Historial de transacciones`, `Nueva consulta`, `Dependencias del frontend`, `Login frontend`, `Historial y filtros`, `Visualización de resultados`, `Créditos e historial UI`, `Cuenta y sesión`, `Compra de paquetes`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `assert`, `{ sanitize }`, `test` to the rest of the system?**
  _308 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dependencias del backend` be split into smaller, more focused modules?**
  _Cohesion score 0.045328399629972246 - nodes in this community are weakly interconnected._
- **Should `Reportes y resultados Tusdatos` be split into smaller, more focused modules?**
  _Cohesion score 0.06659619450317125 - nodes in this community are weakly interconnected._
- **Should `Dependencias del frontend` be split into smaller, more focused modules?**
  _Cohesion score 0.059743954480796585 - nodes in this community are weakly interconnected._