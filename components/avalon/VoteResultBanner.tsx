"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface VoteResultBannerProps {
  approveCount: number;
  rejectCount: number;
  passed: boolean;
}

export function VoteResultBanner({
  approveCount,
  rejectCount,
  passed,
}: VoteResultBannerProps) {
  return (
    <div
      className={`mb-4 py-3 px-4 rounded-xl border text-center ${
        passed
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
      }`}
    >
      <p className="text-sm sm:text-base font-semibold flex flex-wrap items-center justify-center gap-2">
        {passed ? (
          <>
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
            <span>
              투표 결과: 찬성 {approveCount}명, 반대 {rejectCount}명 → 가결
            </span>
          </>
        ) : (
          <>
            <XCircle className="size-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              투표 결과: 찬성 {approveCount}명, 반대 {rejectCount}명 → 부결
            </span>
          </>
        )}
      </p>
    </div>
  );
}
