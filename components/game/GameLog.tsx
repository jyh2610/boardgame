'use client';

import { useRef, useEffect } from 'react';
import { useGame } from '@/lib/use-game';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameLog() {
  const { gameLog } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on new log (logs are newest-first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameLog.length]);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden flex-1 min-h-0">
      <div className="px-3 py-2 border-b border-border bg-muted/50 shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          게임 로그
        </span>
      </div>
      <ScrollArea className="flex-1 h-48 lg:h-full">
        <div ref={scrollRef} className="flex flex-col p-2 gap-1">
          <AnimatePresence initial={false}>
            {gameLog.map((log, i) => (
              <motion.div
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[11px] text-muted-foreground px-2 py-1.5 rounded-lg leading-relaxed ${
                  i === 0 ? 'bg-primary/10 text-foreground font-semibold' : 'bg-muted/30'
                }`}
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
