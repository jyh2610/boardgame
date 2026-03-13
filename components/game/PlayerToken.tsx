"use client";

import { useEffect, useState } from "react";

const SPRITE_COLS = 6;
const SPRITE_ROWS = 4;
const FRAME_INTERVAL_MS = 120; // 애니메이션 속도 (프레임당 ms)

interface PlayerTokenProps {
  playerId: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  xs: "w-6 h-6",
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export default function PlayerToken({
  playerId,
  size = "md",
  className = "",
}: PlayerTokenProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % SPRITE_COLS);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // 스프라이트 행: 파랑(0), 빨강(1), 녹색(2), 노랑(3) | 게임: 빨강(0), 파랑(1), 녹색(2), 노랑(3)
  const rowMap: Record<number, number> = { 0: 1, 1: 0, 2: 2, 3: 3 };
  const row = rowMap[playerId] ?? Math.min(playerId, SPRITE_ROWS - 1);
  const col = frame;

  // 스프라이트 셀 정렬 (왼쪽 프레임 노출 방지를 위해 x축 미세 조정)
  const bgX = (col / (SPRITE_COLS - 1)) * 100 + 1;
  const bgY = (row / (SPRITE_ROWS - 1)) * 100;

  return (
    <div
      className={`${SIZE_MAP[size]} flex-shrink-0 bg-transparent bg-no-repeat overflow-hidden ${className}`}
      style={{
        backgroundImage: "url(/assets/player.png)",
        backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
      }}
      role="img"
      aria-label={`플레이어 ${playerId + 1} 말`}
    />
  );
}
