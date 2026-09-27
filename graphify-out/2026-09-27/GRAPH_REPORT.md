# Graph Report - Sigur  (2026-09-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 492 nodes · 788 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fdfcad27`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- QueryRoutes.js
- QueryResultPage.jsx
- tusdatosQueryLifecycle.js
- tusdatosApi.js
- Back/package.json
- Frond/package.json
- postQuery.js
- sequelize
- routes/index.js
- PostUsers.js
- postQueryRetry.js
- postPaymentCheckout.js
- back_src_db_conn
- db.js
- PackageRoutes.js
- PackagesPage.jsx
- creditMovements.js
- TransactionsPage.jsx
- Login.js
- AuthRoutes.js
- postWompiWebhook.js
- PaymentRoutes.js
- getPackages.js
- UserRoutes.js
- postTusdatosWebhook.js
- updateCurrentUserPassword.js

## God Nodes (most connected - your core abstractions)
1. `App()` - 21 edges
2. `react` - 14 edges
3. `AccountPage()` - 13 edges
4. `QueryResultPage()` - 11 edges
5. `synchronizeTusdatosQuery()` - 11 edges
6. `sequelize` - 10 edges
7. `TransactionsPage()` - 9 edges
8. `CreditMovementsPage()` - 9 edges
9. `HistoryPage()` - 9 edges
10. `requestTusdatos()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `handleQueryCreated()` --calls--> `getCurrentUser()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/services/profileApi.js
- `loadCurrentUser()` --calls--> `getCurrentUser()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/services/profileApi.js
- `loadUser()` --calls--> `getCurrentUser()`  [EXTRACTED]
  Frond/src/pages/Account/AccountPage.jsx → Frond/src/services/profileApi.js
- `App()` --calls--> `CreditMovementsPage()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/pages/Credits/CreditMovementsPage.jsx
- `App()` --calls--> `DashboardPage()`  [EXTRACTED]
  Frond/src/App.jsx → Frond/src/pages/Dashboard/DashboardPage.jsx

## Import Cycles
- None detected.

## Communities (27 total, 1 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.08
Nodes (29): App(), handleQueryCreated(), loadCurrentUser(), getSavedSession(), getInitials(), links, Navbar(), AccountPage() (+21 more)

### Community 1 - "QueryRoutes.js"
Cohesion: 0.05
Nodes (34): filterByDateRange, filterByDocumentType, filterByNameOrDocument, filterByRiskLevel, filterByStatus, formatImageLabel(), getHtmlReportImages(), getReportImages() (+26 more)

### Community 2 - "QueryResultPage.jsx"
Cohesion: 0.08
Nodes (35): DOCUMENT_TYPES, FilterGroup(), FilterPanel(), RISK_OPTIONS, STATUS_OPTIONS, formatDate(), QueryCard(), CreditMovementsPage() (+27 more)

### Community 3 - "tusdatosQueryLifecycle.js"
Cohesion: 0.06
Nodes (39): isTerminalTusdatosError(), { buildResultSummary, getRiskLevel }, {
  classifyTusdatosLaunchResponse,
  getStoredTusdatosReportId,
  normalizeProviderStatus,
}, completeQuery(), getNextPollDate(), {
  getTusdatosQueryResult,
  getTusdatosReportJson,
  hasTusdatosConfiguration,
  isTerminalTusdatosError,
}, inFlightQueries, INITIAL_DELAY_MS (+31 more)

### Community 4 - "tusdatosApi.js"
Cohesion: 0.08
Nodes (38): { conn, User, CreditPackage }, { getTusdatosConfig }, loadCreditPackages(), loadData(), server, startServer(), { startTusdatosQueryMonitor }, back_json_creditpackages (+30 more)

### Community 5 - "Back/package.json"
Cohesion: 0.06
Nodes (37): author, dependencies, bcryptjs, body-parser, cookie-parser, cors, dotenv, express (+29 more)

### Community 6 - "Frond/package.json"
Cohesion: 0.07
Nodes (32): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+24 more)

### Community 7 - "postQuery.js"
Cohesion: 0.13
Nodes (16): { applyCreditMovement }, createHttpError(), DOCUMENT_TYPES, formatTusdatosIssueDate(), {
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
}, { Query, User, conn }, { refundQueryCredit }, {
  registerTusdatosLaunchResponse,
} (+8 more)

### Community 8 - "sequelize"
Cohesion: 0.12
Nodes (8): { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, { DataTypes }, sequelize

### Community 9 - "routes/index.js"
Cohesion: 0.15
Nodes (12): authenticateToken, creditRoutes, getMyCreditMovements, { Router }, authRoutes, creditRoutes, packageRoutes, paymentRoutes (+4 more)

### Community 10 - "PostUsers.js"
Cohesion: 0.19
Nodes (9): { User, UserProfile, CreditWallet }, { User }, bcrypt, { User, CreditWallet, conn }, bcrypt, { User, CreditWallet, conn }, back_src_db_creditwallet, back_src_db_user (+1 more)

### Community 11 - "postQueryRetry.js"
Cohesion: 0.15
Nodes (8): { CreditMovement, Query }, POLL_INTERVAL_MS, { Query }, RETRY_SUPPORTED_TYPES, { retryTusdatosQuery }, { Query, User }, back_src_db_creditmovement, back_src_db_query

### Community 12 - "postPaymentCheckout.js"
Cohesion: 0.17
Nodes (7): { CreditPackage, conn }, { PaymentTransaction, CreditPackage }, { CreditPackage, PaymentTransaction }, crypto, back_src_db_creditpackage, back_src_db_paymenttransaction, ref_crypto

### Community 13 - "back_src_db_conn"
Cohesion: 0.20
Nodes (5): { conn }, { UserProfile, conn }, { CreditPackage, conn }, back_src_db_conn, back_src_db_userprofile

### Community 14 - "db.js"
Cohesion: 0.20
Nodes (9): basename, capsEntries, entries, fs, modelDefiners, path, { Sequelize }, ref_fs (+1 more)

### Community 15 - "PackageRoutes.js"
Cohesion: 0.20
Nodes (7): authenticateToken, authorizeRoles, getPackages, packageRoutes, postPackage, putPackage, { Router }

### Community 16 - "PackagesPage.jsx"
Cohesion: 0.38
Nodes (7): formatCurrency(), openWompiCheckout(), PackagesPage(), handleBuyPackage(), loadPackages(), getPackages(), createPaymentCheckout()

### Community 17 - "creditMovements.js"
Cohesion: 0.36
Nodes (7): applyCreditMovement(), createHttpError(), { CreditWallet, CreditMovement }, validateMovement(), { applyCreditMovement }, { Query, conn }, refundQueryCredit()

### Community 18 - "TransactionsPage.jsx"
Cohesion: 0.42
Nodes (7): formatCurrency(), formatDateTime(), formatPaymentMethod(), getStatusLabel(), TransactionsPage(), loadTransactions(), getMyPaymentTransactions()

### Community 19 - "Login.js"
Cohesion: 0.25
Nodes (5): bcrypt, jwt, { User }, jwt, jsonwebtoken

### Community 20 - "AuthRoutes.js"
Cohesion: 0.25
Nodes (7): authenticateToken, express, getCurrentUser, login, router, updateCurrentUserPassword, updateCurrentUserProfile

### Community 21 - "postWompiWebhook.js"
Cohesion: 0.38
Nodes (6): { applyCreditMovement }, {
  conn,
  PaymentTransaction,
}, crypto, getNestedValue(), hasSameChecksum(), postWompiWebhook()

### Community 22 - "PaymentRoutes.js"
Cohesion: 0.29
Nodes (6): authenticateToken, getMyPaymentTransactions, paymentRoutes, postPaymentCheckout, postWompiWebhook, { Router }

### Community 23 - "getPackages.js"
Cohesion: 0.33
Nodes (3): verifikServiceInfo, { CreditPackage }, verifikServiceInfo

### Community 24 - "UserRoutes.js"
Cohesion: 0.33
Nodes (5): express, getUsers, postUser, postUsers, router

### Community 25 - "postTusdatosWebhook.js"
Cohesion: 0.40
Nodes (3): crypto, { Query }, { synchronizeTusdatosQuery }

## Knowledge Gaps
- **212 isolated node(s):** `links`, `faqGroups`, `tutorials`, `CONSULTATION_TYPES`, `filterByDateRange` (+207 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 260 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `postQuery` (2× useful, score=1.999789433) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sequelize` connect `sequelize` to `tusdatosQueryLifecycle.js`, `Back/package.json`, `db.js`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `express` connect `routes/index.js` to `QueryRoutes.js`, `Back/package.json`, `PackageRoutes.js`, `AuthRoutes.js`, `PaymentRoutes.js`, `UserRoutes.js`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `PackagesPage.jsx`, `QueryResultPage.jsx`, `TransactionsPage.jsx`, `Frond/package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `links`, `faqGroups`, `tutorials` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08115942028985507 - nodes in this community are weakly interconnected._
- **Should `QueryRoutes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05353535353535353 - nodes in this community are weakly interconnected._
- **Should `QueryResultPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._