'use client';

import { cn } from '@/lib/utils';
import { type Tile } from '@/lib/game-data';
import { useGameStore } from '@/lib/game-store';
import { Home, Building2 } from 'lucide-react';

interface TileProps {
  tile: Tile;
  players: { id: number; position: number; color: string; icon: string }[];
  orientation?: 'bottom' | 'left' | 'top' | 'right';
  isActive?: boolean;
}

const TILE_STYLE: Record<Tile['type'], string> = {
  START:   'bg-emerald-600 border-emerald-700',
  CITY:    'bg-card border-border',
  KEY:     'bg-amber-400 border-amber-500',
  JAIL:    'bg-slate-700 border-slate-800',
  WELFARE: 'bg-blue-600 border-blue-700',
  TAX:     'bg-rose-600 border-rose-700',
  TRAVEL:  'bg-indigo-600 border-indigo-700',
  CORNER:  'bg-card border-border',
};

const TILE_SPECIAL_LABEL: Partial<Record<Tile['type'], string>> = {
  START:   '출발',
  KEY:     '황금\n열쇠',
  JAIL:    '무인도',
  WELFARE: '복지\n기금',
  TAX:     '세금',
  TRAVEL:  '우주\n여행',
};

const isCornerTile = (id: number) => id === 0 || id === 9 || id === 18 || id === 27;

export default function TileComponent({ tile, players, orientation = 'bottom', isActive = false }: TileProps) {
  const allPlayers = useGameStore((s) => s.players);

  const playersOnTile = players.filter((p) => p.position === tile.id);
  const ownerPlayer = allPlayers.find((p) => p.properties.some((pr) => pr.tileId === tile.id));
  const ownerProp = ownerPlayer?.properties.find((pr) => pr.tileId === tile.id);

  const corner = isCornerTile(tile.id);
  const styleClass = TILE_STYLE[tile.type] ?? TILE_STYLE.CORNER;

  const isLightBg = tile.type === 'KEY';

  return (
    <div
      className={cn(
        'relative flex flex-col border-2 overflow-hidden select-none transition-all duration-150',
        styleClass,
        corner ? 'w-16 h-16' : 'w-[52px] h-[52px]',
        isActive && 'ring-2 ring-yellow-400 ring-offset-1 shadow-lg shadow-yellow-400/40 scale-105 z-10'
      )}
    >
      {/* Color bar for city tiles */}
      {tile.type === 'CITY' && tile.color && (
        <div
          className={cn(
            'shrink-0',
            orientation === 'top'    ? 'order-last w-full h-2' :
            orientation === 'left'   ? 'absolute left-0 top-0 w-2 h-full' :
            orientation === 'right'  ? 'absolute right-0 top-0 w-2 h-full' :
            /* bottom default */       'w-full h-2'
          )}
          style={{ backgroundColor: tile.color }}
        />
      )}

      {/* Owner dot */}
      {ownerPlayer && tile.type === 'CITY' && (
        <div
          className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/80 z-10 shadow-sm"
          style={{ backgroundColor: ownerPlayer.color }}
        />
      )}

      {/* Houses / Hotel */}
      {ownerProp && ownerProp.houses > 0 && (
        <div className="absolute bottom-0.5 left-0.5 flex gap-px z-10">
          {ownerProp.houses === 4 ? (
            <Building2 size={9} className="text-red-400" />
          ) : (
            Array.from({ length: ownerProp.houses }).map((_, i) => (
              <Home key={i} size={8} className="text-green-400" />
            ))
          )}
        </div>
      )}

      {/* Tile content */}
      <div className="flex flex-col items-center justify-center flex-1 px-0.5 py-0.5 gap-0.5">
        {tile.type === 'CITY' ? (
          <>
            {tile.flag && <span className="text-lg leading-none">{tile.flag}</span>}
            <span className={cn('text-[7px] font-bold text-center leading-tight break-all text-card-foreground', corner && 'text-[8.5px]')}>
              {tile.name}
            </span>
            {tile.price && (
              <span className="text-[6px] text-muted-foreground">
                {(tile.price / 10000).toFixed(0)}만
              </span>
            )}
          </>
        ) : (
          <>
            <span
              className={cn(
                'font-extrabold text-center leading-snug whitespace-pre-line',
                corner ? 'text-[8px]' : 'text-[7px]',
                isLightBg ? 'text-amber-900' : 'text-white'
              )}
            >
              {TILE_SPECIAL_LABEL[tile.type] ?? tile.name}
            </span>
          </>
        )}
      </div>

      {/* Player pieces */}
      {playersOnTile.length > 0 && (
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 pointer-events-none z-20">
          {playersOnTile.map((p) => (
            <div
              key={p.id}
              className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md"
              style={{ backgroundColor: p.color }}
            >
              {p.icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
