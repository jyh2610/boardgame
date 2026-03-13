"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposedTeam } from "./ProposedTeam";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Check, X } from "lucide-react";

interface PhaseQuestingProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
  playerId: string;
  hasSubmittedQuestCard: boolean;
  onSubmitCard: (card: "SUCCESS" | "FAIL") => Promise<void>;
  isActing: boolean;
}

export function PhaseQuesting({
  players,
  proposedTeam,
  playerId,
  hasSubmittedQuestCard,
  onSubmitCard,
  isActing,
}: PhaseQuestingProps) {
  const isOnQuest = proposedTeam.includes(playerId);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>퀘스트 수행</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isOnQuest
            ? "원정대에 포함되었습니다. 성공 또는 실패 카드를 선택하세요."
            : "원정대가 퀘스트를 수행하는 중입니다."}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposedTeam proposedTeam={proposedTeam} players={players} />

        {isOnQuest && hasSubmittedQuestCard ? (
          <div className="py-4 px-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-lg font-semibold text-primary">선택 완료</p>
          </div>
        ) : isOnQuest ? (
          <div className="flex gap-4">
            <Button
              className="flex-1"
              size="lg"
              variant="default"
              onClick={() => onSubmitCard("SUCCESS")}
              disabled={isActing}
            >
              <Check className="size-5 mr-2" />
              성공
            </Button>
            <Button
              className="flex-1"
              size="lg"
              variant="destructive"
              onClick={() => onSubmitCard("FAIL")}
              disabled={isActing}
            >
              <X className="size-5 mr-2" />
              실패
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
