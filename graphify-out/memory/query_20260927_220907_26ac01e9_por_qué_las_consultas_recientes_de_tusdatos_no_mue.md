---
type: "diagnosis"
date: "2026-09-27T22:09:07.215606+00:00"
question: "Por qué las consultas recientes de Tusdatos no muestran respuesta ni aparentan descontar créditos del proveedor"
contributor: "graphify"
outcome: "useful"
source_nodes: ["postQuery", "synchronizeTusdatosQuery", "launchTusdatosQuery", "getTusdatosReportJson", "runTusdatosMonitor"]
---

# Q: Por qué las consultas recientes de Tusdatos no muestran respuesta ni aparentan descontar créditos del proveedor

## Answer

Las dos consultas recientes sí llegaron a POST /api/launch. Tusdatos respondió HTTP exitoso con error lógico 'Documento consultado previamente' y un campo id que corresponde a un reporte existente, pero sin jobid. postQuery guarda únicamente providerResponse.jobid como provider_request_id, por lo que queda null y deja la consulta en processing. synchronizeTusdatosQuery retorna waiting_launch sin provider_request_id y el monitor excluye esas filas, así que nunca completa. GET /api/report_json/{id} respondió correctamente para ambos ids, confirmando que los reportes existen. Sigur sí descontó un crédito interno por consulta al usuario correspondiente; Tusdatos aparentemente no generó un cobro nuevo porque reutilizó reportes previos con force:false.

## Outcome

- Signal: useful

## Source Nodes

- postQuery
- synchronizeTusdatosQuery
- launchTusdatosQuery
- getTusdatosReportJson
- runTusdatosMonitor