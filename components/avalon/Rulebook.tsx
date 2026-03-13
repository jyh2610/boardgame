"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import type { Role, Team } from "@/lib/avalon-engine";
import type { PlayerRoleInfo } from "@/lib/avalon-engine";

const ROLE_NAMES: Record<Role, string> = {
  MERLIN: "멀린",
  PERCIVAL: "퍼시벌",
  LOYAL: "충직한 시민",
  ASSASSIN: "암살자",
  MORGANNA: "모르가나",
  MORDRED: "모드레드",
  OBERON: "오베론",
  MINION: "악의 하수인",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  MERLIN:
    "선의 세력. 밤에 모든 악의 세력을 볼 수 있음 (단, 모드레드는 제외). 원정 3번 성공 시 암살자가 멀린을 지목하면 악의 역전승.",
  PERCIVAL:
    "선의 세력. 밤에 멀린과 모르가나 중 한 명을 볼 수 있음 (둘 다 '멀린 후보'로 표시됨). 진짜 멀린을 찾아 보호해야 함.",
  LOYAL:
    "선의 세력. 특별한 능력 없음. 원정에 참가 시 성공 카드만 제출 가능. 악을 찾아 원정을 성공시키는 것이 목표.",
  ASSASSIN:
    "악의 세력. 악 동료들을 모두 알고 있음. 원정 3번 성공 후 멀린을 정확히 지목하면 악의 역전승.",
  MORGANNA:
    "악의 세력. 퍼시벌에게 멀린 후보로 보임 (멀린과 함께). 악 동료들을 모두 알고 있음.",
  MORDRED:
    "악의 세력. 멀린에게 보이지 않음 (멀린은 모드레드를 악으로 알 수 없음). 악 동료들을 모두 알고 있음.",
  OBERON:
    "악의 세력. 다른 악에게 보이지 않고, 다른 악도 모름. 혼자 행동해야 함.",
  MINION:
    "악의 세력. 악 동료들을 모두 알고 있음. 원정에 참가 시 실패 카드 제출 가능.",
};

function MyRoleSection({ playerRole }: { playerRole: PlayerRoleInfo | null }) {
  if (!playerRole) return null;

  const { myRole, myTeam } = playerRole;
  const roleName = ROLE_NAMES[myRole];
  const description = ROLE_DESCRIPTIONS[myRole];

  return (
    <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-primary">내 역할</h3>
      <p className="text-lg font-bold text-primary">{roleName}</p>
      <p className="text-xs text-muted-foreground">
        {myTeam === "GOOD" ? "선의 세력" : "악의 세력"}
      </p>
      <p className="text-sm text-foreground">{description}</p>
    </div>
  );
}

export function Rulebook({
  playerRole,
  triggerClassName,
}: {
  playerRole: PlayerRoleInfo | null;
  triggerClassName?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={triggerClassName}
          title="룰북 보기"
        >
          <BookOpen className="size-4" />
          룰북
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="shrink-0 px-4 py-3 border-b">
          <SheetTitle>레지스탕스 아발론 룰북</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <MyRoleSection playerRole={playerRole} />

            <section>
              <h3 className="text-sm font-semibold mb-2">게임 개요</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                아발론은 선의 세력과 악의 세력이 대결하는 숨겨진 역할 게임입니다.
                선은 5번의 원정 중 3번 성공해야 하고, 악은 원정 실패나 투표 부결을
                통해 승리합니다.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">승리 조건</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>선: 원정 3번 성공 후 암살에서 멀린이 살아남으면 승리</li>
                <li>악: 원정 3번 실패, 또는 투표 5번 연속 부결 시 즉시 승리</li>
                <li>악: 원정 3번 성공 후 암살자가 멀린을 지목하면 역전승</li>
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
                  <strong>원정대 구성</strong>: 원정대장이 지정된 인원만큼 팀을
                  제안합니다.
                </li>
                <li>
                  <strong>찬반 투표</strong>: 모든 플레이어가 제안된 팀에 찬성/반대
                  투표. 과반수 찬성 시 원정 진행, 부결 시 원정대장이 넘어가고 부결
                  카운트 +1.
                </li>
                <li>
                  <strong>퀘스트 수행</strong>: 원정대원만 성공/실패 카드 제출. 선은
                  성공만, 악은 성공 또는 실패 선택 가능. 7인 이상 4라운드는 실패
                  2장 필요.
                </li>
                <li>
                  <strong>암살</strong>: 원정 3번 성공 시 암살자가 멀린 후보 1명을
                  지목. 멀린이면 악 승리, 아니면 선 승리.
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">역할 설명</h3>
              <div className="space-y-3">
                {(
                  [
                    "MERLIN",
                    "PERCIVAL",
                    "LOYAL",
                    "ASSASSIN",
                    "MORGANNA",
                    "MORDRED",
                    "OBERON",
                    "MINION",
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
              <h3 className="text-sm font-semibold mb-2">원정 인원 (라운드별)</h3>
              <p className="text-sm text-muted-foreground">
                5인: 2-3-2-3-3 / 6인: 2-3-4-3-4 / 7인: 2-3-3-4-4 / 8인: 3-4-4-5-5 /
                9~10인: 3-4-4-5-5
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ※ 7인 이상 4라운드: 실패 2장 있어야 원정 실패
              </p>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
