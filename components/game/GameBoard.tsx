'use client';

import { useGame } from '@/lib/use-game';
import { BOARD_TILES } from '@/lib/game-data';
import TileComponent from './Tile';

/**
 * Board layout - 36 tiles arranged as a ring:
 *
 * Corners: 0 (bottom-right START), 9 (bottom-left JAIL),
 *          18 (top-left TRAVEL), 27 (top-right WELFARE)
 *
 * Bottom row (left→right visual): 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
 * Left col (top→bottom visual):   18, 17, 16, 15, 14, 13, 12, 11, 10, 9
 *   (9 is shared corner, 10-17 are the 8 middle left tiles)
 * Top row (left→right visual):    18, 19, 20, 21, 22, 23, 24, 25, 26, 27
 * Right col (top→bottom visual):  27, 28, 29, 30, 31, 32, 33, 34, 35, 0
 *   (27 is shared corner, 28-35 are the 8 middle right tiles)
 *
 * Grid = 10 columns × 10 rows (corners at each corner)
 */

export default function GameBoard() {
  const { players, movingPath } = useGame();

  const pieces = players.map((p) => ({
    id: p.id,
    position: p.position,
    color: p.color,
    icon: p.icon,
  }));

  const isActive = (id: number) => movingPath.includes(id);

  // Bottom row: displayed left→right as 9..0 (reversed)
  const bottomRow = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  // Left column inner tiles (top→bottom): 17..10
  const leftCol = [17, 16, 15, 14, 13, 12, 11, 10];
  // Top row: left→right as 18..27
  const topRow = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  // Right column inner tiles (top→bottom): 28..35
  const rightCol = [28, 29, 30, 31, 32, 33, 34, 35];

  const TILE_W = 52;
  const CORNER_W = 64;
  const INNER_COLS = 8;
  const CENTER_W = INNER_COLS * TILE_W;
  const CENTER_H = INNER_COLS * TILE_W;

  return (
    <div className="inline-flex flex-col border-2 border-border rounded-sm shadow-2xl bg-card overflow-hidden">
      {/* Top row */}
      <div className="flex flex-row">
        {topRow.map((id) => (
          <TileComponent
            key={id}
            tile={BOARD_TILES[id]}
            players={pieces}
            orientation="top"
            isActive={isActive(id)}
          />
        ))}
      </div>

      {/* Middle: left col + center + right col */}
      <div className="flex flex-row">
        {/* Left column: tiles 17→10 (top→bottom) */}
        <div className="flex flex-col">
          {leftCol.map((id) => (
            <TileComponent
              key={id}
              tile={BOARD_TILES[id]}
              players={pieces}
              orientation="left"
              isActive={isActive(id)}
            />
          ))}
        </div>

        {/* Center board */}
        <div
          style={{ width: CENTER_W, height: CENTER_H, minWidth: CENTER_W, minHeight: CENTER_H }}
          className="relative flex flex-col items-center justify-center bg-emerald-950 overflow-hidden"
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Globe */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 border-4 border-blue-400/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center">
                <span className="text-4xl">🌍</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-primary tracking-widest drop-shadow">부루마블</h2>
            <p className="text-emerald-400 text-[10px] tracking-[0.25em] uppercase font-semibold">
              World Tour
            </p>
          </div>

          {/* Corner stars */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
            <span key={i} className={`absolute ${pos} text-emerald-600/50 text-xs`}>★</span>
          ))}
        </div>

        {/* Right column: tiles 28→35 (top→bottom) */}
        <div className="flex flex-col">
          {rightCol.map((id) => (
            <TileComponent
              key={id}
              tile={BOARD_TILES[id]}
              players={pieces}
              orientation="right"
              isActive={isActive(id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex flex-row">
        {bottomRow.map((id) => (
          <TileComponent
            key={id}
            tile={BOARD_TILES[id]}
            players={pieces}
            orientation="bottom"
            isActive={isActive(id)}
          />
        ))}
      </div>
    </div>
  );
}
