# 🗡️ 레지스탕스 아발론 - TODO 리스트

## 완료 ✅

- [x] 게임 엔진 코어 (`lib/avalon-engine.ts`)

---

## 진행 예정

### 1. 데이터 저장소

- [ ] Supabase `avalon_games` 테이블 생성 (아래 스키마 참고)
- [x] `lib/avalon-sessions.ts` - 아발론 전용 세션 CRUD

<details>
<summary>📋 avalon_games 테이블 스키마 (클릭하여 펼치기)</summary>

**테이블명:** `avalon_games`

| 컬럼명       | 타입          | 제약             | 설명                                   |
| ------------ | ------------- | ---------------- | -------------------------------------- |
| `id`         | `text`        | PRIMARY KEY      | 게임 고유 ID (예: `a1b2c3d4`)          |
| `code`       | `text`        | UNIQUE, NOT NULL | 방 코드 6자 (예: `ABC123`)             |
| `state`      | `jsonb`       | NOT NULL         | 전체 게임 상태 (AvalonMatchState JSON) |
| `created_at` | `timestamptz` | DEFAULT now()    | 생성 시각 (선택)                       |

**Supabase SQL Editor에서 실행:**

```sql
create table avalon_games (
  id text primary key,
  code text unique not null,
  state jsonb not null,
  created_at timestamptz default now()
);

-- RLS 정책 (선택: 공개 읽기/쓰기 허용 시)
alter table avalon_games enable row level security;

create policy "Allow all for avalon_games"
  on avalon_games for all
  using (true)
  with check (true);
```

</details>

### 2. API 라우트

- [x] `POST /api/avalon/games` - 게임 생성
- [x] `POST /api/avalon/games/join` - 방 코드로 참가
- [x] `GET /api/avalon/games/[id]` - 게임 상태 조회
- [x] `POST /api/avalon/games/[id]/action` - 액션 처리

### 3. 클라이언트 API

- [x] `lib/avalon-api.ts` - createGame, joinGame, fetchGame, dispatchAction

### 4. 멀티플레이어 컨텍스트

- [x] `lib/avalon-multiplayer-context.tsx` - 아발론용 Provider

### 5. UI 페이지

- [x] `/resistans_avalon` - 로비 (방 만들기 / 방 참가)
- [x] `/resistans_avalon/[gameId]` - 게임 화면

### 6. Phase별 UI 컴포넌트

- [x] NIGHT - 역할 확인 화면
- [x] TEAM_BUILDING - 원정대장 플레이어 선택 UI
- [x] VOTING - 찬성/반대 버튼
- [x] QUESTING - 원정대원 성공/실패 카드 선택
- [x] ASSASSINATION - 암살자 멀린 지목 UI
- [x] END - 승리/패배 결과 화면

### 7. 공통 컴포넌트

- [x] 퀘스트 트랙 (1~5라운드 성공/실패 표시)
- [x] 부결 카운트 표시
- [x] 플레이어 목록
- [x] 제안된 원정대 표시
