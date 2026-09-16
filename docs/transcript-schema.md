# Claude Code JSONL 트랜스크립트 스키마 — 서브에이전트 모니터링 TUI 관점

> 조사일 **2026-08-19** · Claude Code `version: "2.1.220"` 기록 기준
> 실제 파일에서 추출한 값만 적었다. 추측한 항목은 「미확인」으로 표시했다.
>
> **조사 대상**: `~/.claude/projects/` 하위 JSONL **346개**. 그중 `"name":"Agent"` tool_use 를
> 실제로 포함한 세션을 골라 부모 파일과 서브에이전트 파일을 대조했다.

---

## 0. 가장 먼저 알아야 할 3가지

**① 도구 이름은 `Task` 가 아니라 `Agent` 다.**
`"name":"Task"` 로 grep 하면 **0건**이다(`'"name":\s*"Task"'` 정규식으로도 0건).
TUI 는 `Agent` 를 봐야 한다.

**② 서브에이전트 활동은 «별도 파일»로 완전히 분리된다.** 부모 파일에 섞이지 않는다.
```
~/.claude/projects/<encoded-cwd>/
├── <sessionId>.jsonl                          ← 부모(메인) 대화
└── <sessionId>/
    ├── subagents/
    │   ├── agent-<agentId>.jsonl              ← 서브에이전트 «전체 활동»
    │   └── agent-<agentId>.meta.json          ← 🔑 요약 메타 (아래 §2)
    └── tool-results/                          ← 큰 tool 결과 덤프(.txt)
```
검증: 부모 파일에서 `isSidechain==true` 레코드 **0건**, `agentId` 필드를 가진 레코드 **0건**.
서브에이전트 파일은 전 레코드가 `isSidechain: true` + `agentId` 보유.

**③ 대부분의 spawn 은 «비동기» 다 → `tool_result` 로 완료를 판정할 수 없다.**
실측 세션 3개의 `toolUseResult.status` 분포:

| 세션 | `async_launched` | `completed` |
|---|---|---|
| `c830d2cc…` | 19 | 1 |
| `a5137520…` | 21 | 0 |
| `952cfeaf…` | 22 | 0 |

`async_launched` 는 **spawn 직후** 즉시 기록되고 `totalDurationMs`·`totalTokens`·`toolStats` 가 모두 `null` 이다.
완료는 **나중에 별도 레코드**로 온다(§3).

---

## 1. 레코드 `type` 종류와 최상위 필드

### 1-1. type 분포 (부모 파일 3,004줄 표본)

| `type` | 건수 | 성격 |
|---|---|---|
| `assistant` | 836 | 모델 응답 (tool_use 가 여기 있다) |
| `attachment` | 521 | 첨부/컨텍스트 주입 |
| `user` | 493 | 사용자 입력 **+ tool_result** |
| `system` | 218 | 훅·요약 등 시스템 이벤트 |
| `permission-mode` | 145 | UI 상태 |
| `mode` | 145 | UI 상태 |
| `last-prompt` | 145 | UI 상태 |
| `ai-title` | 142 | 세션 제목 |
| `pr-link` | 132 | PR/MR 링크 |
| `queue-operation` | 128 | 큐 조작 |
| `file-history-snapshot` | 81 | 파일 스냅샷 |
| `file-history-delta` | 18 | 파일 델타 |

🔑 **TUI 가 볼 것은 `assistant` · `user` 두 개면 충분하다.** 나머지는 UI 상태·이력 부산물이다.

### 1-2. 최상위 필드 (실제 `keys` 출력)

**`type: "assistant"`** (가장 흔한 조합)
```json
["cwd","effort","entrypoint","gitBranch","isSidechain","message","parentUuid",
 "requestId","sessionId","session_id","timestamp","type","userType","uuid","version"]
```
변형: MCP 툴 호출 시 `attributionMcpServer`·`attributionMcpTool` 추가 / API 오류 시
`apiErrorStatus`·`error`·`isApiErrorMessage` 추가.

**`type: "user"`** — 두 갈래가 있다
```json
// (a) tool_result 를 담은 것 — sourceToolAssistantUUID·toolUseResult 가 «있다»
["cwd","entrypoint","gitBranch","isSidechain","message","parentUuid","promptId",
 "sessionId","session_id","sourceToolAssistantUUID","timestamp","toolUseResult",
 "type","userType","uuid","version"]

// (b) 사람이 실제로 타이핑한 것 — origin·permissionMode·promptSource 가 «있다»
["cwd","entrypoint","gitBranch","isSidechain","message","origin","parentUuid",
 "permissionMode","promptId","promptSource","sessionId","timestamp","type",
 "userType","uuid","version"]
```
🔑 **`toolUseResult` 유무가 「툴 결과」와 「사람 입력」을 가르는 가장 단순한 판별자다.**

**`type: "system"`**
```json
["cwd","entrypoint","gitBranch","hasOutput","hookAdditionalContext","hookCount",
 "hookErrors","hookInfos","isSidechain","level","parentUuid","preventedContinuation",
 "sessionId","session_id","stopReason","subtype","timestamp","toolUseID","type",
 "userType","uuid","version"]
```
다른 변형에 `durationMs`·`isMeta`·`messageCount`·**`pendingBackgroundAgentCount`** 가 있다
(← 백그라운드 에이전트 수를 세는 데 쓸 수 있다).

**`type: "file-history-snapshot"`** — 스키마가 전혀 다르다(세션 필드가 없다)
```json
["isSnapshotUpdate","messageId","snapshot","type"]
```

---

## 2. 서브에이전트 spawn — 에이전트 타입·설명·ID 를 어디서 얻나

### 2-1. spawn 레코드 = `assistant` 안의 `tool_use`

```json
{
  "uuid": "b03b679d-2f39-400f-b2a4-30e3d044792c",
  "parentUuid": "11da3abc-1df0-45b8-ad97-597133405c0d",
  "timestamp": "2026-08-06T07:38:18.128Z",
  "message": { "content": [ {
      "type": "tool_use",
      "id": "toolu_01CqckfGXyesQD3dH4XycYCo",
      "name": "Agent",
      "input": {
        "subagent_type": "frontend",
        "description": "Replace ui tokens in root.module.css",
        "prompt": "…"
      }
  } ] }
}
```

| 필요한 값 | 경로 |
|---|---|
| 에이전트 타입 | `message.content[].input.subagent_type` (예 `"frontend"`) |
| 설명 | `message.content[].input.description` |
| **spawn 상관키** | `message.content[].id` = **`toolUseId`** (예 `toolu_01Cqck…`) |
| 지시 프롬프트 | `message.content[].input.prompt` |

⚠️ **이 레코드에는 `agentId` 가 «없다».** `agentId` 는 실행이 시작된 뒤에 생기고
`tool_result`(§3) 또는 `meta.json`(§2-2)에서 얻는다.

### 2-2. 🔑 `meta.json` — TUI 에 가장 값싼 소스

`<sessionId>/subagents/agent-<agentId>.meta.json` (실물 전체):
```json
{
  "agentType": "frontend",
  "description": "Restyle document affordances and panels",
  "toolUseId": "toolu_01WNDcRRvVi6LnUCvdQuyMKN",
  "spawnDepth": 1
}
```
- **파일명이 곧 `agentId`** (`agent-a003528ab5b878c95.jsonl` → `a003528ab5b878c95`)
- `toolUseId` 로 **부모의 spawn tool_use 와 바로 조인**된다
- `spawnDepth` 로 중첩(에이전트가 에이전트를 띄운 경우) 판별
- 🔑 **JSONL 을 파싱하지 않고도 «누가 떠 있나」를 알 수 있다** — 디렉터리 스캔만으로 목록이 나온다

### 2-3. `subagent_type` 으로 grep 하면 오탐이 난다

`subagent_type` 문자열은 **도구 설명 텍스트**(시스템 프롬프트)에도 들어 있어서,
Agent 를 한 번도 쓰지 않은 세션에서도 매칭된다. 실측: 33개 파일이 매칭됐으나 그중
실제 `Agent` tool_use 가 있는 파일은 극소수. **`"name":"Agent"` 로 걸러야 한다.**

---

## 3. 완료 판정 방법

**두 경로가 있고, 비동기가 기본이다.**

### 3-1. 동기(`status: "completed"`) — `tool_result` 로 판정 가능

`type: "user"` 레코드가 `tool_use_id` 로 매칭된다:
```json
{
  "type": "user",
  "uuid": "4be2d938-cbfa-4558-9462-2569901f7592",
  "parentUuid": "b03b679d-2f39-400f-b2a4-30e3d044792c",
  "sourceToolAssistantUUID": "b03b679d-2f39-400f-b2a4-30e3d044792c",
  "timestamp": "2026-08-06T07:40:42.797Z",
  "message": { "content": [ {
    "type": "tool_result",
    "tool_use_id": "toolu_01CqckfGXyesQD3dH4XycYCo",
    "is_error": null,
    "content": [ { "type": "text", "text": "작업 완료. 변경 파일은 …" } ]
  } ] },
  "toolUseResult": { … }
}
```

**`toolUseResult` 실물 (완료 케이스)** — 모니터링에 필요한 수치가 전부 여기 있다:
```json
{
  "agentId": "aa525ddf236e68bb8",
  "agentType": "frontend",
  "status": "completed",
  "resolvedModel": "claude-opus-5[1m]",
  "totalDurationMs": 140198,
  "totalTokens": 50111,
  "totalToolUseCount": 11,
  "toolStats": {
    "readCount": 2, "searchCount": 0, "bashCount": 7,
    "editFileCount": 2, "linesAdded": 13, "linesRemoved": 12, "otherToolCount": 0
  },
  "usage": { "input_tokens": …, "output_tokens": …, "cache_read_input_tokens": …,
             "iterations": …, "service_tier": …, "speed": … }
}
```
`toolUseResult` 키 전체:
`["agentId","agentType","content","prompt","resolvedModel","status","toolStats","totalDurationMs","totalTokens","totalToolUseCount","usage"]`

### 3-2. 비동기(`status: "async_launched"`) — `tool_result` 는 «완료가 아니다»

spawn 직후 즉시 기록되고 수치가 전부 `null` 이다:
```json
{ "agentId": "a5b027cd07049a41b", "agentType": null, "status": "async_launched",
  "resolvedModel": "claude-opus-5[1m]", "totalDurationMs": null, "totalTokens": null,
  "totalToolUseCount": null, "toolStats": null, "usage": null }
```
⚠️ `agentType` 이 **`null`** 로 오는 것도 주의(타입은 spawn tool_use 나 `meta.json` 에서 얻어야 한다).

**실제 완료는 «별도 `user` 레코드」로 온다** — `message.content` 가 **배열이 아니라 문자열**이고
`<task-notification>` XML 블록을 담는다:
```json
{ "type": "user", "uuid": "53afc7b7-…", "parentUuid": "ba2a874b-…",
  "isSidechain": false, "timestamp": "2026-08-19T00:14:48.249Z",
  "message": { "role": "user", "content": "…<task-notification>…" } }
```
문자열에서 파싱할 태그(실측):

| 태그 | 예시 값 |
|---|---|
| `<task-id>` | `ae61221577f9f69bd` ← **`agentId` 와 같은 값** |
| `<status>` | `completed` |
| `<summary>` | `Agent "사용자 입력 유효성 나머지 3필드" finished` |
| `<output-file>` | 서브에이전트 transcript 경로 |

🔑 **TUI 권장 판정 로직**
```
spawn      : assistant.tool_use(name=="Agent")            → toolUseId, subagent_type, description
agentId 확보: 같은 toolUseId 의 toolUseResult.agentId      (또는 meta.json 의 toolUseId 조인)
동기 완료   : toolUseResult.status == "completed"          → 수치 그대로 사용
비동기 완료 : message.content(문자열) 의 <task-id> == agentId && <status>
보조 신호   : agent-<agentId>.jsonl 의 mtime 정지 / system.pendingBackgroundAgentCount
```
⚠️ `<status>` 에서 `completed` 외의 값(실패·중단)은 이번 표본에서 관측되지 않았다 — **미확인**.
`is_error` 필드는 존재하며 관측값은 `null` 뿐이었다.

---

## 4. 서브에이전트 내부 활동의 분리

**완전히 분리된다.** §0-② 의 디렉터리 구조 참고.

서브에이전트 파일(`agent-a003528ab5b878c95.jsonl`, 79줄) type 분포:
`assistant` 49 · `user` 28 · `attachment` 2.
🔑 `system`·`mode`·`ai-title` 같은 **UI 부산물이 없다** — 파싱이 부모보다 단순하다.

**서브에이전트 `assistant` 최상위 필드** (부모와 다른 점이 핵심):
```json
["agentId","attributionAgent","cwd","effort","entrypoint","gitBranch","isSidechain",
 "message","parentUuid","requestId","sessionId","slug","timestamp","type","userType",
 "uuid","version"]
```

| 필드 | 실측값 | 용도 |
|---|---|---|
| `agentId` | `"a003528ab5b878c95"` | **파일 전체에서 단일값.** 파일명과 일치 |
| `isSidechain` | `true` | 서브에이전트 레코드 판별 |
| `attributionAgent` | `"frontend"` | 에이전트 타입(= `subagent_type`) |
| `slug` | `"mighty-honking-sutton"` | 사람이 읽는 라벨. 파일 내 단일값 |
| `sessionId` | `"c830d2cc-…"` | **부모 세션 id 와 동일** → 부모 조인 키 |
| `parentUuid` | 첫 레코드는 `null` | 파일 내부 체인의 시작점 |

서브에이전트의 첫 `user` 레코드는 `parentUuid: null` + `message.content` 가 **문자열**(지시 프롬프트).

> ⚠️ **`isSidechain` 을 jq 로 셀 때 함정** — `.isSidechain // "absent"` 는 `false` 를 falsy 로 보고
> 전부 `absent` 로 만든다. `(.isSidechain|tostring)` 을 쓸 것. (조사 중 실제로 오판했다)

---

## 5. 실행 중인 툴 이름 추출

`assistant` 레코드의 `message.content[]` 중 `type=="tool_use"` 의 **`name`**:
```bash
jq -r 'select(.type=="assistant")|.message.content[]?
        |select(.type=="tool_use")|.name' agent-<id>.jsonl
```
서브에이전트 1개 실측: `Bash 15 · Read 5 · Write 4 · Edit 3`.

- **MCP 툴**은 `name` 이 `mcp__<server>__<tool>` 형태이고, 레코드 최상위에
  `attributionMcpServer`·`attributionMcpTool` 이 함께 붙는다 → 서버별 집계에 쓸 수 있다
- **「현재 실행 중」 판정**: 해당 `tool_use.id` 에 대응하는 `tool_result`(같은 파일의 `user` 레코드,
  `message.content[].tool_use_id`)가 **아직 없으면** 진행 중이다.
  즉 *미결 tool_use 집합 = 실행 중인 툴*
- `toolUseResult.toolStats` 는 **종료 후 집계**라 실시간 표시용으로는 못 쓴다

---

## 6. 부모–자식 관계를 잇는 필드

**두 층위를 구분해야 한다.**

### 6-1. 레코드 체인 (같은 파일 내부)
- `uuid` — 레코드 고유 id
- `parentUuid` — 직전 레코드의 `uuid` (파일 시작점은 `null`)
- `sourceToolAssistantUUID` — tool_result 레코드가 **자신을 유발한 assistant 레코드의 `uuid`** 를 가리킨다
  (실측: `parentUuid` 와 같은 값이었다)

### 6-2. 세션 ↔ 서브에이전트 (파일 간)

| 잇는 축 | 부모 쪽 | 자식 쪽 |
|---|---|---|
| **tool_use** | `tool_use.id` | `meta.json.toolUseId` |
| **agentId** | `toolUseResult.agentId` / `<task-id>` | 파일명 · 레코드의 `agentId` |
| **세션** | `sessionId` | `sessionId` (**동일 값**) |
| 타입 | `input.subagent_type` | `attributionAgent` |

🔑 **가장 견고한 조인은 `toolUseId`** 다 — spawn 시점에 확정되고 `meta.json` 이 그대로 갖고 있어서,
비동기라 `agentId` 를 아직 못 받은 순간에도 이어진다.

---

## 7. 프로젝트 식별용 필드

거의 모든 레코드(`assistant`·`user`·`system`·`attachment`)에 공통으로 있다:

| 필드 | 실측값 | 비고 |
|---|---|---|
| `cwd` | `"/Users/gimseob-u/Documents/Gitlab/intellectual-discovery-fe"` | **프로젝트 절대경로** |
| `sessionId` | `"c830d2cc-3306-49d3-a8dc-520dbb935d7e"` | **파일명과 동일** |
| `session_id` | 같은 값 | 🔴 **snake_case 중복 필드.** 일부 레코드엔 `sessionId` 만 있다 → **`sessionId` 를 정본으로** |
| `gitBranch` | `"feat/smk-editor-tone-and-manner"` | 브랜치 표시에 유용 |
| `version` | `"2.1.220"` | Claude Code 버전. **스키마 분기 판단에 쓸 것** |
| `cwd` 인코딩 | 디렉터리명 `-Users-gimseob-u-Documents-Gitlab-intellectual-discovery-fe` | `/` → `-` 치환 |
| `userType` · `entrypoint` | — | 존재 확인. 값 종류는 **미확인** |
| `effort` | `assistant` 에만 | 추론 강도 |

⚠️ 디렉터리명 인코딩은 `/` → `-` 치환으로 보이지만 **역변환이 모호하다**
(경로에 원래 `-` 가 있으면 구분 불가). `cwd` 필드를 쓰는 게 안전하다.

---

## 8. TUI 구현 권고

**감시 대상**
```
~/.claude/projects/*/                        # 세션 파일 (append-only)
~/.claude/projects/*/*/subagents/*.meta.json # 🔑 신규 에이전트 감지 = 가장 저렴
~/.claude/projects/*/*/subagents/*.jsonl     # 에이전트 활동 tail
```

1. **목록은 `meta.json` 디렉터리 스캔으로** 만든다 — `agentType`·`description`·`toolUseId`·`spawnDepth`
   가 즉시 나오고 JSONL 파싱이 필요 없다
2. **활동은 `agent-<id>.jsonl` 을 tail** 한다 — 파일이 작고 UI 부산물이 없다
3. **완료는 두 경로를 모두** 본다 — 동기는 `toolUseResult.status=="completed"`,
   비동기는 부모 파일의 `<task-notification>` 문자열
4. **「실행 중인 툴」은 미결 `tool_use`** 로 계산한다(`tool_result` 가 아직 없는 `tool_use.id`)
5. `session_id`/`sessionId` 중복, `isSidechain` 의 falsy 함정, `agentType: null`(async) 을 방어한다

**남은 미확인 항목**
- 실패·취소 시 `status` / `<status>` 값 (표본에 `completed` 만 존재)
- `spawnDepth ≥ 2`(중첩 spawn) 의 파일 배치
- `userType`·`entrypoint` 의 값 종류
- 서브에이전트 파일이 실시간으로 flush 되는지(버퍼링 지연 여부)
