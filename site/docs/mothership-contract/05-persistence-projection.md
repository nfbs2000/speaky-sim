# 5. Persistence Projection

Projection means converting stream/runtime state into stored data and client-readable state. In this repo, Mothership uses existing `copilot_*` tables with `chat_type = 'mothership'`.

## DB Tables

Relevant schema lives in [`packages/db/schema.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/packages/db/schema.ts).

```mermaid
erDiagram
  copilot_chats ||--o{ copilot_messages : has
  copilot_chats ||--o{ copilot_runs : has
  copilot_runs ||--o{ copilot_run_checkpoints : has
  copilot_runs ||--o{ copilot_async_tool_calls : has
  copilot_chats ||--o{ workflow_checkpoints : has
```

## Table Roles

| Table | Role |
| --- | --- |
| `copilot_chats` | chat container, `type`, title, workspace, resources, read state |
| `copilot_messages` | message content, role, stream id, token counts |
| `copilot_runs` | execution/run lifecycle, status, provider/model, request context |
| `copilot_run_checkpoints` | pause/resume state for pending tool calls |
| `copilot_async_tool_calls` | async tool status, args, result, error |
| `workflow_checkpoints` | workflow state snapshots tied to chat/message |
| `usage_log` | cost ledger source including `mothership_block` |

## Chat Projection

[`mothershipChatSchema`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/api/contracts/mothership-chats.ts#L217) exposes the chat list shape:

| Field | Role |
| --- | --- |
| `id` | chat id |
| `title` | display title |
| `updatedAt` | ordering and freshness |
| `activeStreamId` | current stream marker |
| `lastSeenAt` | read marker |
| `pinned` | pinned state |

```mermaid
flowchart LR
  Stream["stream events"] --> Messages["copilot_messages"]
  Stream --> Runs["copilot_runs"]
  Stream --> Resources["chat resources"]
  Runs --> ChatList["activeStreamId / status"]
  Messages --> Detail["chat detail"]
```

## Replay And Detail View

[`getMothershipChatResponseSchema`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/api/contracts/mothership-chats.ts#L313) returns messages, active stream id, resources, timestamps, and optional stream snapshot.

```mermaid
sequenceDiagram
  participant UI
  participant API as chat detail route
  participant DB as copilot tables
  participant Snapshot as stream snapshot

  UI->>API: open chat
  API->>DB: chat/messages/resources
  DB-->>API: persisted rows
  API->>Snapshot: optional stream state
  API-->>UI: detail response
```

## Cost Projection

`usage_log` contains source values including `copilot`, `mcp_copilot`, and `mothership_block`. Workflow block output can also carry `tokens` and `cost` fields through execute response and block handler normalization.

```mermaid
flowchart TD
  Run["run result"] --> ExecuteResponse["execute response"]
  ExecuteResponse --> BlockOutput["workflow block output"]
  Run --> UsageLog["usage_log"]
  UsageLog --> BillingViews["billing / cost views"]
```
