"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposedTeam } from "./ProposedTeam";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle } from "lucide-react";

interface PhaseVotingProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
  canVote: boolean;
  hasVoted: boolean;
  onVote: (vote: "APPROVE" | "REJECT") => Promise<void>;
  isActing: boolean;
  lastVoteResult?: {
    approveCount: number;
    rejectCount: number;
    passed: boolean;
  };
}

export function PhaseVoting({
  players,
  proposedTeam,
  canVote,
  hasVoted,
  onVote,
  isActing,
  lastVoteResult,
}: PhaseVotingProps) {
  const allVoted = players.every((p) => p.vote !== null);
  const approveCount = allVoted
    ? players.filter((p) => p.vote === "APPROVE").length
    : 0;
  const rejectCount = allVoted
    ? players.filter((p) => p.vote === "REJECT").length
    : 0;
  const voteResult =
    lastVoteResult ??
    (allVoted
      ? { approveCount, rejectCount, passed: approveCount > players.length / 2 }
      : null);

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

        {voteResult && (
          <div
            className={`py-4 px-6 rounded-xl border text-center ${
              voteResult.passed
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <p className="text-lg font-semibold flex items-center justify-center gap-2">
              {voteResult.passed ? (
                <>
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                  찬성 {voteResult.approveCount}명, 반대{" "}
                  {voteResult.rejectCount}명 → 가결!
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-red-600 dark:text-red-400" />
                  찬성 {voteResult.approveCount}명, 반대{" "}
                  {voteResult.rejectCount}명 → 부결
                </>
              )}
            </p>
          </div>
        )}

        {hasVoted && !voteResult ? (
          <div className="py-4 px-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-lg font-semibold text-primary">투표 완료</p>
          </div>
        ) : !hasVoted && canVote ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
        ) : null}
      </CardContent>
    </Card>
  );
}
