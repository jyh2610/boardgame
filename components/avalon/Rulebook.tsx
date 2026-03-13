"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb } from "lucide-react";
import type { Role, Team } from "@/lib/avalon-engine";
import type { PlayerRoleInfo } from "@/lib/avalon-engine";
import { GAME_TITLE, ROLE_NAMES, TERMS } from "@/lib/avalon-theme";

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  JUNGJO:
    "규장각. 밤에 노론 벽파를 모두 볼 수 있음 (단, 정순왕후는 제외). 사명 3번 성공 시 존현각 자객이 정조를 지목하면 노론 벽파의 역전승.",
  JUNGYAKYONG:
    "규장각. 밤에 정조와 심환지 중 한 명을 볼 수 있음 (둘 다 '정조 후보'로 표시됨). 진짜 정조를 찾아 보호해야 함.",
  GYUJANGGAK:
    "규장각. 특별한 능력 없음. 사명에 참가 시 성공 카드만 제출 가능. 노론 벽파를 찾아 사명을 성공시키는 것이 목표.",
  JAGAP:
    "노론 벽파. 동료들을 모두 알고 있음. 사명 3번 성공 후 정조를 정확히 지목하면 노론 벽파의 역전승.",
  SIMHWANJI:
    "노론 벽파. 정약용에게 정조 후보로 보임 (정조와 함께). 노론 동료들을 모두 알고 있음.",
  JEONGSUNWANGHU:
    "노론 벽파. 정조에게 보이지 않음 (정조는 정순왕후를 노론으로 알 수 없음). 노론 동료들을 모두 알고 있음.",
  HONGGUKYEONG:
    "노론 벽파. 다른 노론에게 보이지 않고, 다른 노론도 모름. 혼자 행동해야 함.",
  NORON_BYOKPA:
    "노론 벽파. 동료들을 모두 알고 있음. 사명에 참가 시 실패 카드 제출 가능.",
};

/** 역할별 행동 어드바이스 - 내가 취하면 좋은 행동 */
const ROLE_ADVICE: Record<Role, string> = {
  JUNGJO:
    "• 노론 벽파를 알고 있으니 사명단에 노론이 들어가지 않도록 채팅으로 은근히 유도하세요.\n• 너무 직접적으로 지목하면 자객의 타겟이 됩니다. 애매하게 힌트만 주세요.\n• 투표 패턴을 보며 노론을 추리하는 데 도움을 주세요.",
  JUNGYAKYONG:
    "• 정조 후보 둘 중 진짜 정조를 찾아 그 사람 말을 따르세요.\n• 정조가 암살당하지 않도록, 정조 후보를 지나치게 드러내지 않게 조절하세요.\n• 노론(심환지)이 정조 행세를 할 수 있으니 말과 행동을 꼼꼼히 비교하세요.",
  GYUJANGGAK:
    "• 투표·채팅 패턴을 보며 노론 벽파를 추리하세요.\n• 사명단에 노론이 섞였을 가능성이 있으면 반대표를 던지세요.\n• 정약용·정조의 힌트에 귀 기울이세요.",
  JAGAP:
    "• 사명에 참가하면 적절한 타이밍에 실패 카드를 넣으세요.\n• 규장각이 3승하면 정조를 지목해야 하니, 채팅·투표 패턴으로 정조를 추리하세요.\n• 노론 동료들과 암묵적으로 협력하세요.",
  SIMHWANJI:
    "• 정약용에게 정조 후보로 보이니, 정조 행세로 정약용을 혼란시키세요.\n• 노론 동료들과 협력해 사명 실패·투표 부결을 노리세요.\n• 암살 단계에서 자객이 정조를 고르는 데 도움을 주세요.",
  JEONGSUNWANGHU:
    "• 정조에게 안 보이므로 비교적 안전하게 행동할 수 있습니다.\n• 노론 동료들과 협력하되, 규장각처럼 행동해 의심을 덜 받으세요.\n• 사명에 들어가면 전략적으로 실패 카드를 사용하세요.",
  HONGGUKYEONG:
    "• 다른 노론을 모르니 혼자 판단해야 합니다. 투표·사명 패턴을 잘 읽으세요.\n• 노론처럼 보이지 않게 행동하다가, 사명에 참가할 때만 실패를 넣으세요.\n• 규장각 쪽이 혼란스러워 보이면 그때 반대표를 활용하세요.",
  NORON_BYOKPA:
    "• 노론 동료들과 협력해 사명 실패·투표 부결을 노리세요.\n• 사명에 참가하면 타이밍을 보고 실패 카드를 제출하세요.\n• 규장각처럼 행동해 의심을 덜 받으세요.",
};

function MyRoleSection({ playerRole }: { playerRole: PlayerRoleInfo | null }) {
  if (!playerRole) return null;

  const { myRole, myTeam } = playerRole;
  const roleName = ROLE_NAMES[myRole];
  const description = ROLE_DESCRIPTIONS[myRole];

  const advice = ROLE_ADVICE[myRole];

  return (
    <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-primary">내 역할</h3>
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold text-primary">{roleName}</p>
        {advice && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-primary hover:text-primary/80 transition-colors p-0.5 rounded hover:bg-primary/10"
                aria-label="행동 어드바이스"
              >
                <Lightbulb className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-[280px] whitespace-pre-line text-left leading-relaxed py-2.5"
            >
              <span className="font-semibold">💡 내가 취하면 좋은 행동</span>
              <span className="block mt-1.5">{advice}</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {myTeam === "GOOD" ? TERMS.goodForce : TERMS.evilForce}
      </p>
      <p className="text-sm text-foreground">{description}</p>
    </div>
  );
}

export function Rulebook({
  playerRole,
  triggerClassName,
  compact,
}: {
  playerRole: PlayerRoleInfo | null;
  triggerClassName?: string;
  compact?: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={triggerClassName}
          title="룰북 보기"
        >
          <BookOpen className="size-4" />
          {!compact && <span className="ml-1.5">룰북</span>}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="shrink-0 px-4 py-3 border-b">
          <SheetTitle>{GAME_TITLE} 룰북</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 space-y-6">
            <MyRoleSection playerRole={playerRole} />

            <section>
              <h3 className="text-sm font-semibold mb-2">게임 개요</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                조선비사는 정조 시대, 규장각(선)과 노론 벽파(악)의 대결을
                배경으로 한 숨겨진 역할 게임입니다. 규장각은 5번의 사명 중 3번
                성공해야 하고, 노론 벽파는 사명 실패나 투표 부결을 통해
                승리합니다.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">승리 조건</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  규장각: 사명 3번 성공 후 암살에서 정조가 살아남으면 승리
                </li>
                <li>
                  노론 벽파: 사명 3번 실패, 또는 투표 5번 연속 부결 시 즉시 승리
                </li>
                <li>
                  노론 벽파: 사명 3번 성공 후 존현각 자객이 정조를 지목하면
                  역전승
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">게임 진행</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  <strong>밤</strong>: 역할 확인. 각자 자신의 역할과 특수 정보를
                  확인합니다.
                </li>
                <li>
                  <strong>사명단 구성</strong>: 사명장이 지정된 인원만큼 팀을
                  제안합니다.
                </li>
                <li>
                  <strong>찬반 투표</strong>: 모든 플레이어가 제안된 팀에
                  찬성/반대 투표. 과반수 찬성 시 사명 진행, 부결 시 사명장이
                  넘어가고 부결 카운트 +1.
                </li>
                <li>
                  <strong>사명 수행</strong>: 사명단원만 성공/실패 카드 제출.
                  규장각은 성공만, 노론 벽파는 성공 또는 실패 선택 가능. 7인
                  이상 4라운드는 실패 2장 필요.
                </li>
                <li>
                  <strong>암살</strong>: 사명 3번 성공 시 존현각 자객이 정조
                  후보 1명을 지목. 정조면 노론 벽파 승리, 아니면 규장각 승리.
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">역할 설명</h3>
              <div className="space-y-3">
                {(
                  [
                    "JUNGJO",
                    "JUNGYAKYONG",
                    "GYUJANGGAK",
                    "JAGAP",
                    "SIMHWANJI",
                    "JEONGSUNWANGHU",
                    "HONGGUKYEONG",
                    "NORON_BYOKPA",
                  ] as Role[]
                ).map((role) => (
                  <div
                    key={role}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <p className="font-semibold">{ROLE_NAMES[role]}</p>
                    <p className="text-muted-foreground mt-1">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">
                사명 인원 (라운드별)
              </h3>
              <p className="text-sm text-muted-foreground">
                5인: 2-3-2-3-3 / 6인: 2-3-4-3-4 / 7인: 2-3-3-4-4 / 8인:
                3-4-4-5-5 / 9~10인: 3-4-4-5-5
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ※ 7인 이상 4라운드: 실패 2장 있어야 사명 실패
              </p>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
