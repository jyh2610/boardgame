"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposedTeam } from "./ProposedTeam";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface PhaseVotingProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
  canVote: boolean;
  hasVoted: boolean;
  onVote: (vote: "APPROVE" | "REJECT") => Promise<void>;
  isActing: boolean;
}

export function PhaseVoting({
  players,
  proposedTeam,
  canVote,
  hasVoted,
  onVote,
  isActing,
}: PhaseVotingProps) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>찬반 투표</CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasVoted
            ? "투표가 완료되었습니다. 다른 플레이어의 투표를 기다리는 중..."
            : "제안된 원정대에 찬성하시겠습니까?"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposedTeam proposedTeam={proposedTeam} players={players} />

        {hasVoted ? (
          <div className="py-4 px-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-lg font-semibold text-primary">투표 완료</p>
          </div>
        ) : (
          canVote && (
            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                variant="default"
                onClick={() => onVote("APPROVE")}
                disabled={isActing}
              >
                <ThumbsUp className="size-5 mr-2" />
                찬성
              </Button>
              <Button
                className="flex-1"
                size="lg"
                variant="destructive"
                onClick={() => onVote("REJECT")}
                disabled={isActing}
              >
                <ThumbsDown className="size-5 mr-2" />
                반대
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
