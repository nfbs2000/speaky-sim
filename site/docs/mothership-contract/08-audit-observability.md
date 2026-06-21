# 8. Audit / Observability

The adapter has several observability paths: structured loggers, OTel spans, generated trace attributes, run state, and usage ledger rows.

## Logger Locations

```mermaid
flowchart TD
  Route["Mothership route loggers"] --> Logs["structured logs"]
  Stream["CopilotGoStream logger"] --> Logs
  Tool["ToolExecutor logger"] --> Logs
  Resources["resource/file/table tool loggers"] --> Logs
```

Examples:

| Code | Logger name |
| --- | --- |
| [`execute/route.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/app/api/mothership/execute/route.ts) | `MothershipExecuteAPI` |
| [`chats/route.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/app/api/mothership/chats/route.ts) | `MothershipChatsAPI` |
| [`request/go/stream.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/request/go/stream.ts) | `CopilotGoStream` |
| [`tool-executor/executor.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/tool-executor/executor.ts) | `ToolExecutor` |

## OTel Path

[`request/otel.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/request/otel.ts) defines span helpers for lifecycle and tool work.

```mermaid
flowchart LR
  Root["start root span"] --> RequestShape["request shape attrs"]
  Root --> Stream["stream span"]
  Stream --> ToolSpan["tool.execute span"]
  Stream --> Outcome["outcome / error status"]
```

Key helpers:

| Helper | Role |
| --- | --- |
| `getCopilotTracer` | tracer name/version |
| `withIncomingGoSpan` | parent inbound Go-called handler spans |
| `withCopilotSpan` | lifecycle operation span |
| `withCopilotToolSpan` | Sim-side tool work span |
| `markSpanForError` | error status/exception recording |
| `isActionableErrorStatus` | alert-worthy HTTP status filtering |

## Trace Attributes

The code stamps attributes such as request id, chat id, workflow id, execution id, run id, stream id, route, transport, model/provider, and tool names.

```mermaid
flowchart TD
  Request["request"] --> Attrs["TraceAttr"]
  Attrs --> Ids["request/chat/workflow/execution/run/stream"]
  Attrs --> Shape["mode/model/provider/files/context"]
  Attrs --> Tool["tool name/call id/executor"]
```

## Usage Ledger

[`usage_log`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/packages/db/schema.ts#L2659) has a `source` enum containing `mothership_block`. This is the ledger-like cost path; stream events and traces are observability data, while `usage_log` is the durable cost attribution table.

```mermaid
flowchart LR
  Execution["execution"] --> Usage["usage_log"]
  Usage --> Source["source = mothership_block"]
  Usage --> Cost["cost"]
  Usage --> Scope["workspaceId / workflowId / executionId"]
```

## Reading Rule

Use logs and traces for debugging the runtime. Use persisted run/message rows for replay. Use `usage_log` for cost attribution.
