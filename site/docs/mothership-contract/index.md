# 전체 개요

Mothership contract는 하나의 파일이 아닙니다. 여러 경계가 합쳐진 계약입니다.

1. 브라우저와 Sim route 사이의 HTTP 계약
2. Sim adapter와 hosted backend 사이의 request payload 계약
3. hosted backend가 다시 보내는 Stream v1 event 계약
4. tool call을 Sim 내부 tool executor로 연결하는 실행 계약
5. stream을 DB, replay buffer, UI 상태로 바꾸는 projection 계약
6. workflow 안에서 Mothership block으로 호출되는 block 입출력 계약

## 왜 contract가 중요한가

Mothership backend 내부 planner, system prompt, model routing은 공개 코드에 없습니다. 하지만 adapter contract는 공개 코드에 있습니다. 이것만으로도 다음을 알 수 있습니다.

| 질문 | 공개 contract로 알 수 있는 것 |
| --- | --- |
| 무엇을 요청할 수 있나 | message, workspaceId, chatId, context, file attachments, tool schema |
| 어떤 이벤트가 흘러오나 | session, text, tool, span, resource, run, error, complete |
| tool은 어디서 실행되나 | go, sim, client executor 경계 |
| 결과는 어디에 남나 | copilot chat/message/run 상태, replay buffer, UI stream |
| workflow에서는 어떻게 보이나 | Mothership block의 prompt/files 입력과 content/toolCalls/cost 출력 |

## Contract Stack

```mermaid
flowchart TB
  A["사용자 요청"] --> B["HTTP Route Contract"]
  B --> C["Request Payload Contract"]
  C --> D["Hosted Backend<br/>비공개"]
  D --> E["Stream v1 Contract"]
  E --> F["Tool Execution Contract"]
  E --> G["Persistence Projection"]
  F --> H["Sim Tools / DB / Files"]
  G --> I["UI Replay / Chat History"]
  C --> J["Workflow Block Contract"]
  J --> F
```

## Public Adapter가 드러내는 범위

```mermaid
flowchart LR
  subgraph Public["공개 소스에서 확인 가능"]
    Routes["/api/mothership routes"]
    Payload["payload builder"]
    Stream["generated stream schema"]
    ToolBridge["tool executor bridge"]
    Store["stream persistence"]
    Block["Mothership block handler"]
    Tests["contract tests"]
  end

  subgraph Private["공개 소스로 단정하면 안 되는 영역"]
    Planner["planner"]
    Prompt["system prompt"]
    ModelRouting["model routing"]
    BackendPolicy["hosted backend policy"]
  end

  Routes --> Payload --> Private
  Private --> Stream --> ToolBridge
  Stream --> Store
  Block --> Routes
  Tests --> Public
```

## 핵심 코드 링크

| 영역 | 코드 |
| --- | --- |
| Stream v1 타입 | [`mothership-stream-v1.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/generated/mothership-stream-v1.ts) |
| Stream v1 runtime schema | [`mothership-stream-v1-schema.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/generated/mothership-stream-v1-schema.ts) |
| Mothership API contract | [`mothership-chats.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/api/contracts/mothership-chats.ts) |
| Unified chat route | [`chat/post.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/chat/post.ts) |
| Payload builder | [`payload.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/chat/payload.ts) |
| Go stream loop | [`request/go/stream.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/lib/copilot/request/go/stream.ts) |
| Mothership block | [`blocks/mothership.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/blocks/blocks/mothership.ts) |
| Mothership block handler | [`mothership-handler.ts`](https://github.com/nfbs2000/speaky-sim/blob/db47da58d/apps/sim/executor/handlers/mothership/mothership-handler.ts) |

## 읽는 순서

처음 보는 사람은 이 순서가 가장 쉽습니다.

```mermaid
flowchart LR
  Scope["1. 공개 범위"] --> Map["2. 코드 지도"]
  Map --> Request["3. 요청 계약"]
  Request --> Stream["4. Stream v1"]
  Stream --> Tool["5. Tool Bridge"]
  Tool --> Persist["6. 저장/재생"]
  Persist --> Block["7. Workflow Block"]
  Block --> Tests["8. 테스트"]
```
