"use client";

import { useGame } from "@/lib/use-game";
import { BOARD_TILES } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Building2, Home, Hammer } from "lucide-react";
import PlayerToken from "./PlayerToken";

function formatMoney(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(0)}만`;
  return n.toLocaleString();
}

export default function PlayerStatus() {
  const { players, currentPlayerIndex, phase, buildHouse, isMyTurn } =
    useGame();

  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => {
        const isActive = player.id === currentPlayerIndex && !player.isBankrupt;
        const canBuild = isActive && isMyTurn;
        const currentTile = BOARD_TILES[player.position];

        return (
          <div
            key={player.id}
            className={cn(
              "rounded-xl border-2 p-3 transition-all duration-300",
              player.isBankrupt
                ? "opacity-40 bg-muted border-muted"
                : isActive
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card",
            )}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
              <PlayerToken playerId={player.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-bold text-sm truncate">
                    {player.name}
                  </span>
                  {isActive && (
                    <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      내 턴
                    </span>
                  )}
                  {player.isJailed && (
                    <span className="text-[9px] bg-slate-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                      무인도
                    </span>
                  )}
                  {player.isBankrupt && (
                    <span className="text-[9px] bg-destructive text-white px-1.5 py-0.5 rounded-full shrink-0">
                      파산
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {currentTile.flag && `${currentTile.flag} `}
                  {currentTile.name}
                </div>
              </div>
            </div>

            {/* Money */}
            <div className="flex items-center justify-between bg-muted/60 rounded-lg px-2.5 py-1.5 mb-2">
              <span className="text-[10px] text-muted-foreground">
                보유 자금
              </span>
              <span
                className={cn(
                  "font-bold text-sm tabular-nums",
                  player.money < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                ₩{formatMoney(player.money)}
              </span>
            </div>

            {/* Properties */}
            {player.properties.length > 0 && (
              <div>
                <div className="text-[9px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
                  소유 도시 ({player.properties.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {player.properties.map((prop) => {
                    const tile = BOARD_TILES[prop.tileId];
                    const houseCost = Math.floor((tile.price || 0) * 0.5);
                    const canBuildHouse =
                      canBuild &&
                      prop.houses < 4 &&
                      phase === "ROLL" &&
                      player.money >= houseCost;

                    return (
                      <button
                        key={prop.tileId}
                        onClick={() => canBuildHouse && buildHouse(prop.tileId)}
                        disabled={!canBuildHouse}
                        title={
                          canBuild && prop.houses < 4
                            ? `집 건설 (${(houseCost / 10000).toFixed(0)}만원) ${canBuildHouse ? "" : "- 자금 부족"}`
                            : prop.houses === 4
                              ? "호텔 완성"
                              : ""
                        }
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-all",
                          canBuildHouse
                            ? "hover:scale-110 cursor-pointer hover:shadow-md"
                            : "cursor-default",
                        )}
                        style={{
                          backgroundColor: (tile.color ?? "#888") + "22",
                          borderColor: tile.color ?? "#888",
                          color: tile.color ?? "#888",
                        }}
                      >
                        {tile.flag}
                        {prop.houses === 4 ? (
                          <Building2 size={8} />
                        ) : prop.houses > 0 ? (
                          Array.from({ length: prop.houses }).map((_, i) => (
                            <Home key={i} size={7} />
                          ))
                        ) : canBuildHouse ? (
                          <Hammer size={7} className="opacity-60" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
