---
type: "implementation"
date: "2026-09-27T22:40:12.240277+00:00"
question: "perfecto como ya terminamos la prioridad inmedita ahora realiza todos los cambios de prioridad alta"
contributor: "graphify"
outcome: "useful"
source_nodes: ["postQuery", "applyCreditMovement", "refundQueryCredit", "requestTusdatos", "synchronizeTusdatosQuery", "runTusdatosMonitor", "postTusdatosWebhook", "NewQueryPage", "HistoryPage"]
---

# Q: perfecto como ya terminamos la prioridad inmedita ahora realiza todos los cambios de prioridad alta

## Answer

Expanded via graph vocab: [query, credit, transaction, provider, request, monitor, poll, retry, webhook, refund, status, error]. Implemented all high-priority improvements: transactional 60-second same-user/same-document idempotency before credit movement and provider launch; explicit replay UX; exponential polling backoff with jitter and 30-second cap; configurable 240-attempt ceiling; atomic database lease for multi-instance monitors; local overlap guard; structured PII-sanitized JSON logging; AsyncLocalStorage request-id propagation; provider duration/status metrics; query, credit and refund counters; public liveness endpoint and admin-only metrics endpoint; database index for recent-query deduplication; and 22 node:test cases covering launch variants, reused reports, webhook completion, transient/terminal errors, duplicate events, orphan timeout, max attempts, refund idempotency, backoff, redaction, risk summaries and response normalization. Migration applied and both expected indexes verified. Backend tests/syntax/diff check, frontend ESLint/build, health 200 and protected metrics 401 all passed.

## Outcome

- Signal: useful

## Source Nodes

- postQuery
- applyCreditMovement
- refundQueryCredit
- requestTusdatos
- synchronizeTusdatosQuery
- runTusdatosMonitor
- postTusdatosWebhook
- NewQueryPage
- HistoryPage