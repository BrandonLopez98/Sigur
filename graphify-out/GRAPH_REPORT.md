# Graph Report - Sigur  (2026-09-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 570 nodes · 930 edges · 34 communities (27 shown, 7 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fdfcad27`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App
- tusdatosQueryLifecycle.js
- QueryRoutes.js
- Back/package.json
- tusdatosApi.js
- Frond/package.json
- tusdatosLifecycle.test.js
- postQuery.js
- observability.js
- sequelize
- creditMovements.js
- AccountPage
- AuthRoutes.js
- postPaymentCheckout.js
- postTusdatosWebhook.js
- UserRoutes.js
- Back/index.js
- Login.js
- db.js
- PackagesPage.jsx
- express
- routes/index.js
- PackageRoutes.js
- FilterPanel.jsx
- PostUser.js
- PaymentRoutes.js
- getPackages.js
- users_estebanlopez_desktop_sigur_back_src_services_creditmovements_applycreditmovement
- users_estebanlopez_desktop_sigur_back_src_services_refundquerycredit_refundquerycredit
- users_estebanlopez_desktop_sigur_back_src_services_tusdatosapi_gettusdatosqueryresult
- users_estebanlopez_desktop_sigur_back_src_services_tusdatosapi_hastusdatosconfiguration
- users_estebanlopez_desktop_sigur_back_src_services_tusdatosapi_isterminaltusdatoserror
- users_estebanlopez_desktop_sigur_back_src_services_tusdatosapi_launchtusdatosquery
- users_estebanlopez_desktop_sigur_back_src_services_tusdatosapi_launchtusdatosvehiclequery

## God Nodes (most connected - your core abstractions)
1. `App()` - 21 edges
2. `incrementMetric()` - 15 edges
3. `logEvent()` - 14 edges
4. `synchronizeTusdatosQuery()` - 14 edges
5. `react` - 14 edges
6. `AccountPage()` - 12 edges
7. `requestTusdatos()` - 12 edges
8. `sequelize` - 11 edges
9. `QueryResultPage()` - 10 edges
10. `express` - 10 edges

## Surprising Connections (you probably didn't know these)
- `handleLoadMore()` --calls--> `getCreditMovements()`  [EXTRACTED]
  Frond/src/pages/Credits/CreditMovementsPage.jsx → Frond/src/services/creditsApi.js
- `loadMovements()` --calls--> `getCreditMovements()`  [EXTRACTED]
  Frond/src/pages/Credits/CreditMovementsPage.jsx → Frond/src/services/creditsApi.js
- `App()` --calls--> `AccountPage()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/pages/Account/AccountPage.jsx
- `App()` --calls--> `PackagesPage()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/pages/Packages/PackagesPage.jsx
- `App()` --calls--> `getCurrentUser()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/services/profileApi.js

## Import Cycles
- None detected.

## Communities (34 total, 7 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (55): App(), getSavedSession(), getInitials(), links, Navbar(), formatDate(), QueryCard(), CreditMovementsPage() (+47 more)

### Community 1 - "tusdatosQueryLifecycle.js"
Cohesion: 0.07
Nodes (45): incrementMetric(), logEvent(), { applyCreditMovement }, createRefundQueryCredit(), { incrementMetric, logEvent }, { Query, conn }, refundQueryCredit, hasTusdatosConfiguration() (+37 more)

### Community 2 - "QueryRoutes.js"
Cohesion: 0.05
Nodes (34): filterByDateRange, filterByDocumentType, filterByNameOrDocument, filterByRiskLevel, filterByStatus, formatImageLabel(), getHtmlReportImages(), getReportImages() (+26 more)

### Community 3 - "Back/package.json"
Cohesion: 0.05
Nodes (39): author, dependencies, bcryptjs, body-parser, cookie-parser, cors, dotenv, express (+31 more)

### Community 4 - "tusdatosApi.js"
Cohesion: 0.09
Nodes (31): { getTusdatosReportPdf }, { Query }, {
  getTusdatosQueryResult,
}, POLL_INTERVAL_MS, { Query }, RETRY_SUPPORTED_TYPES, { retryTusdatosQuery }, ALLOWED_DOCUMENT_TYPES (+23 more)

### Community 5 - "Frond/package.json"
Cohesion: 0.06
Nodes (33): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+25 more)

### Community 6 - "tusdatosLifecycle.test.js"
Cohesion: 0.07
Nodes (23): sanitize(), registerTusdatosLaunchResponse(), classifyTusdatosLaunchResponse(), firstNonEmptyString(), getStoredTusdatosReportId(), normalizeProviderStatus(), assert, { sanitize } (+15 more)

### Community 7 - "postQuery.js"
Cohesion: 0.09
Nodes (23): { conn }, { applyCreditMovement }, createHttpError(), DOCUMENT_TYPES, {
  findRecentDuplicateQuery,
  markAsIdempotentReplay,
}, formatTusdatosIssueDate(), { incrementMetric, logEvent }, {
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
} (+15 more)

### Community 8 - "observability.js"
Cohesion: 0.13
Nodes (14): getHealth(), getHealthMetrics(), { getMetricsSnapshot }, authenticateToken, authorizeRoles, { getHealth, getHealthMetrics }, healthRoutes, { Router } (+6 more)

### Community 9 - "sequelize"
Cohesion: 0.12
Nodes (8): { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, sequelize

### Community 10 - "creditMovements.js"
Cohesion: 0.20
Nodes (13): { applyCreditMovement }, {
  conn,
  PaymentTransaction,
}, crypto, getNestedValue(), hasSameChecksum(), postWompiWebhook(), applyCreditMovement(), createHttpError() (+5 more)

### Community 11 - "AccountPage"
Cohesion: 0.24
Nodes (11): handleQueryCreated(), loadCurrentUser(), AccountPage(), handlePasswordSubmit(), handleProfileSubmit(), loadUser(), formatDate(), getInitials() (+3 more)

### Community 12 - "AuthRoutes.js"
Cohesion: 0.15
Nodes (11): { User, UserProfile, CreditWallet }, { UserProfile, conn }, back_src_db_creditwallet, back_src_db_userprofile, authenticateToken, express, getCurrentUser, login (+3 more)

### Community 13 - "postPaymentCheckout.js"
Cohesion: 0.17
Nodes (7): { CreditPackage, conn }, { PaymentTransaction, CreditPackage }, { CreditPackage, PaymentTransaction }, crypto, back_src_db_creditpackage, back_src_db_paymenttransaction, ref_crypto

### Community 14 - "postTusdatosWebhook.js"
Cohesion: 0.17
Nodes (7): { CreditMovement, Query }, { Query, User }, crypto, { Query }, { synchronizeTusdatosQuery }, back_src_db_creditmovement, back_src_db_query

### Community 15 - "UserRoutes.js"
Cohesion: 0.18
Nodes (9): { User }, bcrypt, { User, CreditWallet, conn }, back_src_db_user, express, getUsers, postUser, postUsers (+1 more)

### Community 16 - "Back/index.js"
Cohesion: 0.22
Nodes (10): { conn, User, CreditPackage }, { getTusdatosConfig }, loadCreditPackages(), loadData(), server, startServer(), { startTusdatosQueryMonitor }, back_json_creditpackages (+2 more)

### Community 17 - "Login.js"
Cohesion: 0.20
Nodes (6): bcrypt, jwt, { User }, bcrypt, { User }, bcryptjs

### Community 18 - "db.js"
Cohesion: 0.20
Nodes (9): basename, capsEntries, entries, fs, modelDefiners, path, { Sequelize }, ref_fs (+1 more)

### Community 19 - "PackagesPage.jsx"
Cohesion: 0.38
Nodes (7): formatCurrency(), openWompiCheckout(), PackagesPage(), handleBuyPackage(), loadPackages(), getPackages(), createPaymentCheckout()

### Community 20 - "express"
Cohesion: 0.22
Nodes (7): jwt, authenticateToken, creditRoutes, getMyCreditMovements, { Router }, express, jsonwebtoken

### Community 21 - "routes/index.js"
Cohesion: 0.22
Nodes (8): authRoutes, creditRoutes, healthRoutes, packageRoutes, paymentRoutes, queryRoutes, { Router }, userRoutes

### Community 22 - "PackageRoutes.js"
Cohesion: 0.25
Nodes (7): authenticateToken, authorizeRoles, getPackages, packageRoutes, postPackage, putPackage, { Router }

### Community 23 - "FilterPanel.jsx"
Cohesion: 0.29
Nodes (5): DOCUMENT_TYPES, FilterGroup(), FilterPanel(), RISK_OPTIONS, STATUS_OPTIONS

### Community 24 - "PostUser.js"
Cohesion: 0.29
Nodes (4): { CreditPackage, conn }, bcrypt, { User, CreditWallet, conn }, back_src_db_conn

### Community 25 - "PaymentRoutes.js"
Cohesion: 0.29
Nodes (6): authenticateToken, getMyPaymentTransactions, paymentRoutes, postPaymentCheckout, postWompiWebhook, { Router }

### Community 26 - "getPackages.js"
Cohesion: 0.33
Nodes (3): verifikServiceInfo, { CreditPackage }, verifikServiceInfo

## Knowledge Gaps
- **250 isolated node(s):** `links`, `faqGroups`, `tutorials`, `MOVEMENT_CONFIG`, `GROUPS` (+245 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 312 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `postQuery` (3× useful, score=2.999230494) _(code changed — re-verify)_
- `postTusdatosWebhook` (2× useful, score=1.999594962) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sequelize` connect `sequelize` to `tusdatosQueryLifecycle.js`, `db.js`, `Back/package.json`, `postQuery.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `express` connect `express` to `QueryRoutes.js`, `Back/package.json`, `observability.js`, `AuthRoutes.js`, `UserRoutes.js`, `routes/index.js`, `PackageRoutes.js`, `PaymentRoutes.js`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `react` connect `App` to `PackagesPage.jsx`, `AccountPage`, `Frond/package.json`, `FilterPanel.jsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `links`, `faqGroups`, `tutorials` to the rest of the system?**
  _250 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05160628844839371 - nodes in this community are weakly interconnected._
- **Should `tusdatosQueryLifecycle.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06980392156862746 - nodes in this community are weakly interconnected._
- **Should `QueryRoutes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05353535353535353 - nodes in this community are weakly interconnected._