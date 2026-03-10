'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/use-game';
import { cn } from '@/lib/utils';

const DOT_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 28, y: 28 }, { x: 72, y: 72 }],
  3: [{ x: 28, y: 28 }, { x: 50, y: 50 }, { x: 72, y: 72 }],
  4: [{ x: 28, y: 28 }, { x: 72, y: 28 }, { x: 28, y: 72 }, { x: 72, y: 72 }],
  5: [{ x: 28, y: 28 }, { x: 72, y: 28 }, { x: 50, y: 50 }, { x: 28, y: 72 }, { x: 72, y: 72 }],
  6: [{ x: 28, y: 20 }, { x: 72, y: 20 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 28, y: 80 }, { x: 72, y: 80 }],
};

function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <motion.div
      className="w-14 h-14 bg-white rounded-xl shadow-lg border-2 border-gray-200 flex items-center justify-center"
      animate={rolling ? { rotate: [0, 90, 270, 360, 540, 720], scale: [1, 0.85, 1.1, 0.9, 1] } : { rotate: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        {(DOT_POSITIONS[value] ?? DOT_POSITIONS[1]).map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={9} fill="#1a1a2e" />
        ))}
      </svg>
    </motion.div>
  );
}

export default function DiceControl() {
  const { phase, diceValues, diceRolling, rollDice, finishMoving, setDiceRolling, movingPath, setState, isMyTurn } =
    useGame();

  const animatingRef = useRef(false);
  const stepRef = useRef(0);

  // Step-by-step movement animation
  useEffect(() => {
    if (phase !== 'MOVING' || movingPath.length === 0 || animatingRef.current) return;

    animatingRef.current = true;
    stepRef.current = 0;

    const tick = () => {
      setState((s) => {
        const path = s.movingPath;
        if (stepRef.current >= path.length) {
          animatingRef.current = false;
          setDiceRolling(false);
          finishMoving();
          return s;
        }
        const nextPos = path[stepRef.current];
        const currentIdx = s.currentPlayerIndex;
        stepRef.current++;
        setTimeout(tick, 200);
        return {
          players: s.players.map((p, idx) =>
            idx === currentIdx ? { ...p, position: nextPos } : p
          ),
        };
      });
    };

    setTimeout(tick, 350);
  }, [phase, movingPath.length, finishMoving, setDiceRolling, setState]);

  const canRoll = phase === 'ROLL' && isMyTurn;
  const total = diceValues[0] + diceValues[1];

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">주사위</span>

      {/* Dice faces */}
      <div className="flex gap-3 items-center">
        <DiceFace value={diceValues[0]} rolling={diceRolling} />
        <span className="text-xl font-bold text-muted-foreground">+</span>
        <DiceFace value={diceValues[1]} rolling={diceRolling} />
      </div>

      {/* Total */}
      <AnimatePresence mode="wait">
        <motion.div
          key={total}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          className="text-4xl font-black text-primary tabular-nums leading-none"
        >
          {total}
        </motion.div>
      </AnimatePresence>

      {/* Roll button */}
      <motion.button
        onClick={canRoll ? rollDice : undefined}
        disabled={!canRoll}
        whileHover={canRoll ? { scale: 1.04 } : {}}
        whileTap={canRoll ? { scale: 0.96 } : {}}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-150',
          canRoll
            ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md cursor-pointer'
            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
        )}
      >
        {phase === 'MOVING'
          ? '이동 중...'
          : phase === 'ROLL'
          ? '주사위 굴리기'
          : '대기 중...'}
      </motion.button>
    </div>
  );
}
