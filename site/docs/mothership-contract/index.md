# Mothership Adapter Map

코드에서 보이는 Mothership은 하나의 함수가 아니라 adapter 묶음입니다. route, payload builder, generated stream type, stream loop, tool executor, DB projection, workflow block handler가 연결됩니다.

## Adapter Stack

```mermaid
flowchart TB
  Ingress["Ingress"] --> Api["/api/mothership routes"]
  Api --> Contract["route contracts"]
  Api --> Payload["payload builder"]
  Payload --> Stream["stream loop"]
  Stream --> Events["Stream v1 event types"]
  Stream --> ToolBridge["tool execution bridge"]
  Stream --> Projection["persistence projection"]
  ToolBridge --> Projection
  Workflow["workflow block"] --> Execute["/api/mothership/execute"]
  Execute --> Payload
```

## Main Files

| Layer | Code |
| --- | --- |
| route contracts | [`apps/sim/lib/api/contracts/mothership-chats.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/api/contracts/mothership-chats.ts) |
| chat routes | [`apps/sim/app/api/mothership`](https://github.com/nfbs2000/speaky-sim/tree/db47da58d/apps/sim/app/api/mothership) |
| payload builder | [`apps/sim/lib/copilot/chat/payload.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/chat/payload.ts) |
| stream types | [`apps/sim/lib/copilot/generated/mothership-stream-v1.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/generated/mothership-stream-v1.ts) |
| stream schema | [`apps/sim/lib/copilot/generated/mothership-stream-v1-schema.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/generated/mothership-stream-v1-schema.ts) |
| stream loop | [`apps/sim/lib/copilot/request/go/stream.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/request/go/stream.ts) |
| SSE parser | [`apps/sim/lib/copilot/request/go/parser.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/request/go/parser.ts) |
| tool executor | [`apps/sim/lib/copilot/tool-executor`](https://github.com/nfbs2000/speaky-sim/tree/db47da58d/apps/sim/lib/copilot/tool-executor) |
| workflow block | [`apps/sim/blocks/blocks/mothership.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/blocks/blocks/mothership.ts) |
| block handler | [`apps/sim/executor/handlers/mothership/mothership-handler.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/executor/handlers/mothership/mothership-handler.ts) |
| DB tables | [`packages/db/schema.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/packages/db/schema.ts) |

## Request To Projection

```mermaid
sequenceDiagram
  participant Client
  participant Route as Mothership Route
  participant Payload as Payload Builder
  participant Stream as Stream Loop
  participant Tool as Tool Executor
  participant DB as DB Projection

  Client->>Route: chat or execute request
  Route->>Payload: message, workspace, files, context
  Payload-->>Route: request payload
  Route->>Stream: run lifecycle
  Stream-->>Route: text/tool/run/resource events
  Stream->>Tool: sim/client tool work when needed
  Stream->>DB: chat, message, run, resource state
  Route-->>Client: stream update or final JSON
```

## Reading Order

```mermaid
flowchart LR
  A["1. Identity"] --> B["2. Request"]
  B --> C["3. Stream"]
  C --> D["4. Tool Bridge"]
  D --> E["5. Persistence"]
  E --> F["6. Role / Permission"]
  F --> G["7. Completion"]
  G --> H["8. Observability"]
  H --> I["9. Compatibility"]
```
