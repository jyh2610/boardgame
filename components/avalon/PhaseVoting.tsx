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
  onVote: (vote: "APPROVE" | "REJECT") => Promise<void>;
  isActing: boolean;
}

export function PhaseVoting({
  players,
  proposedTeam,
  canVote,
  onVote,
  isActing,
}: PhaseVotingProps) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>찬반 투표</CardTitle>
        <p className="text-sm text-muted-foreground">
          제안된 원정대에 찬성하시겠습니까?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposedTeam proposedTeam={proposedTeam} players={players} />

        {canVote && (
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
        )}
      </CardContent>
    </Card>
  );
}
