---
type: "query"
date: "2026-09-27T22:12:20.793772+00:00"
question: "perfecto que otros cambios recomiendas realizar?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["postQuery", "synchronizeTusdatosQuery", "runTusdatosMonitor", "postTusdatosWebhook", "completeQuery", "refundQueryCredit", "requestTusdatos", "QueryResultPage"]
---

# Q: perfecto que otros cambios recomiendas realizar?

## Answer

Expanded from original query via graph vocab: [query, tusdatos, provider, launch, monitor, poll, webhook, report, result, credit, refund, error]. Recomendaciones priorizadas: 1) normalizar y validar todas las respuestas de lanzamiento: jobid implica polling, id reutilizado implica completar descargando report_json, y ninguna de las dos implica fallo con reintegro; 2) crear reconciliador para pending/processing sin provider_request_id y reparar las dos filas actuales sin relanzar; 3) hacer que el webhook pueda completar directamente mediante reportId aunque no exista jobid; 4) añadir pruebas automáticas de contrato y ciclo de vida, actualmente no existen; 5) usar backoff con jitter y límite de intentos, además de bloqueo distribuido si hay varias instancias; 6) mejorar estados y errores del frontend, evitando polling infinito; 7) añadir logs estructurados, métricas y correlation ids; 8) definir idempotencia y política de cobro para documentos repetidos; 9) minimizar y proteger PII en provider_response, logs y metadata; 10) validar configuración al arranque y separar credenciales Bearer/Basic.

## Outcome

- Signal: useful

## Source Nodes

- postQuery
- synchronizeTusdatosQuery
- runTusdatosMonitor
- postTusdatosWebhook
- completeQuery
- refundQueryCredit
- requestTusdatos
- QueryResultPage