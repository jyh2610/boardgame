"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AvalonGameLogProps {
  gameLog: string[];
  className?: string;
}

export function AvalonGameLog({ gameLog, className }: AvalonGameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 최신 로그 추가 시 상단으로 스크롤 (로그는 최신순)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameLog.length]);

  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0 ${className ?? ""}`}
    >
      <div className="px-3 py-2 border-b border-border bg-muted/50 shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          게임 로그
        </span>
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 overflow-y-auto h-24 sm:h-32 lg:h-40"
      >
        <div className="flex flex-col p-2 gap-1">
          <AnimatePresence initial={false}>
            {(gameLog ?? []).map((log, i) => (
              <motion.div
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[11px] text-muted-foreground px-2 py-1.5 rounded-lg leading-relaxed ${
                  i === 0
                    ? "bg-primary/10 text-foreground font-semibold"
                    : "bg-muted/30"
                }`}
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          {(!gameLog || gameLog.length === 0) && (
            <div className="text-[11px] text-muted-foreground/60 py-4 text-center">
              게임이 진행되면 로그가 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
