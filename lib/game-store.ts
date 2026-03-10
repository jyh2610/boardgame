'use client';

import { create } from 'zustand';
import {
  BOARD_TILES,
  GOLDEN_KEY_EVENTS,
  INITIAL_MONEY,
  PLAYER_COLORS,
  PLAYER_ICONS,
  TOTAL_TILES,
  type Tile,
} from './game-data';

export interface Property {
  tileId: number;
  houses: number; // 0=없음, 1-3=집, 4=호텔
}

export interface Player {
  id: number;
  name: string;
  position: number;
  money: number;
  properties: Property[];
  isJailed: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  color: string;
  icon: string;
}

export type GamePhase =
  | 'SETUP'
  | 'ROLL'
  | 'MOVING'
  | 'EVENT'
  | 'BUY'
  | 'PAY_RENT'
  | 'GOLDEN_KEY'
  | 'JAIL'
  | 'TAX'
  | 'WELFARE'
  | 'TRAVEL'
  | 'GAME_OVER';

export interface ModalData {
  tile: Tile;
  owner?: Player;
  rent?: number;
  goldenKeyEvent?: (typeof GOLDEN_KEY_EVENTS)[0];
  tax?: number;
  welfare?: number;
}

interface GameStore {
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  diceValues: [number, number];
  diceRolling: boolean;
  modalData: ModalData | null;
  gameLog: string[];
  numPlayers: number;
  movingPath: number[]; // positions to animate through

  // Setup
  initGame: (numPlayers: number, names: string[]) => void;
  resetToSetup: () => void;

  // Dice
  rollDice: () => void;
  setDiceRolling: (v: boolean) => void;

  // Movement
  movePlayer: (playerId: number, steps: number) => void;
  setMovingPath: (path: number[]) => void;
  finishMoving: () => void;

  // Events
  buyProperty: () => void;
  declineBuy: () => void;
  payRent: () => void;
  handleGoldenKey: () => void;
  confirmGoldenKey: () => void;
  handleJailEscape: () => void;
  handleTax: () => void;
  handleWelfare: () => void;
  handleTravel: () => void;
  confirmModal: () => void;
  buildHouse: (tileId: number) => void;

  endTurn: () => void;
  addLog: (msg: string) => void;
}

const createInitialPlayers = (num: number, names: string[]): Player[] =>
  Array.from({ length: num }, (_, i) => ({
    id: i,
    name: names[i] || `플레이어 ${i + 1}`,
    position: 0,
    money: INITIAL_MONEY,
    properties: [],
    isJailed: false,
    jailTurns: 0,
    isBankrupt: false,
    color: PLAYER_COLORS[i],
    icon: PLAYER_ICONS[i],
  }));

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  currentPlayerIndex: 0,
  phase: 'SETUP',
  diceValues: [1, 1],
  diceRolling: false,
  modalData: null,
  gameLog: [],
  numPlayers: 2,
  movingPath: [],

  initGame: (numPlayers, names) => {
    set({
      players: createInitialPlayers(numPlayers, names),
      currentPlayerIndex: 0,
      phase: 'ROLL',
      diceValues: [1, 1],
      diceRolling: false,
      modalData: null,
      gameLog: ['게임이 시작되었습니다!'],
      numPlayers,
      movingPath: [],
    });
  },

  resetToSetup: () => {
    set({
      players: [],
      currentPlayerIndex: 0,
      phase: 'SETUP',
      diceValues: [1, 1],
      diceRolling: false,
      modalData: null,
      gameLog: [],
      numPlayers: 2,
      movingPath: [],
    });
  },

  rollDice: () => {
    const d1 = Math.ceil(Math.random() * 6);
    const d2 = Math.ceil(Math.random() * 6);
    const steps = d1 + d2;
    set({ diceValues: [d1, d2], diceRolling: true, phase: 'MOVING' });
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];

    // Build path
    const path: number[] = [];
    for (let i = 1; i <= steps; i++) {
      path.push((player.position + i) % TOTAL_TILES);
    }
    set({ movingPath: path });
    get().addLog(`${player.name} 주사위: ${d1} + ${d2} = ${steps}`);
  },

  setDiceRolling: (v) => set({ diceRolling: v }),

  movePlayer: (playerId, steps) => {
    const { players } = get();
    const updated = players.map((p) => {
      if (p.id !== playerId) return p;
      const oldPos = p.position;
      const newPos = (p.position + steps) % TOTAL_TILES;
      // passed start bonus
      const passedStart = newPos < oldPos || (oldPos === 0 && steps > 0);
      return { ...p, position: newPos, money: passedStart ? p.money + 200000 : p.money };
    });
    set({ players: updated });
  },

  setMovingPath: (path) => set({ movingPath: path }),

  finishMoving: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const tile = BOARD_TILES[player.position];

    if (player.isJailed) {
      set({ phase: 'JAIL', modalData: { tile } });
      return;
    }

    switch (tile.type) {
      case 'START':
        get().addLog(`${player.name} 출발! +200,000원`);
        set({ players: players.map((p) => p.id === player.id ? { ...p, money: p.money + 200000 } : p) });
        get().endTurn();
        break;
      case 'CITY': {
        const owner = players.find((p) => p.properties.some((pr) => pr.tileId === tile.id));
        if (!owner) {
          set({ phase: 'BUY', modalData: { tile } });
        } else if (owner.id === player.id) {
          get().addLog(`${player.name} 본인 소유지 통과`);
          get().endTurn();
        } else {
          const prop = owner.properties.find((pr) => pr.tileId === tile.id)!;
          const rentTable = [tile.rent || 0, tile.houseRent || 0, tile.houseRent || 0, tile.houseRent || 0, tile.hotelRent || 0];
          const rent = rentTable[Math.min(prop.houses, 4)];
          set({ phase: 'PAY_RENT', modalData: { tile, owner, rent } });
        }
        break;
      }
      case 'KEY':
        get().handleGoldenKey();
        break;
      case 'JAIL':
        get().addLog(`${player.name} 무인도로! 2턴 대기`);
        set({
          players: players.map((p) => p.id === player.id ? { ...p, isJailed: true, jailTurns: 2 } : p),
          phase: 'JAIL',
          modalData: { tile },
        });
        break;
      case 'WELFARE':
        get().handleWelfare();
        break;
      case 'TAX':
        get().handleTax();
        break;
      case 'TRAVEL':
        get().handleTravel();
        break;
      default:
        get().endTurn();
    }
  },

  buyProperty: () => {
    const { players, currentPlayerIndex, modalData } = get();
    const player = players[currentPlayerIndex];
    if (!modalData) return;
    const tile = modalData.tile;
    if (!tile.price) return;

    if (player.money < tile.price) {
      get().addLog(`${player.name} 자금 부족으로 구매 불가`);
      get().endTurn();
      return;
    }

    const updated = players.map((p) => {
      if (p.id !== player.id) return p;
      return {
        ...p,
        money: p.money - tile.price!,
        properties: [...p.properties, { tileId: tile.id, houses: 0 }],
      };
    });
    get().addLog(`${player.name} ${tile.name} 구매 (${(tile.price / 10000).toFixed(0)}만원)`);
    set({ players: updated, modalData: null });
    get().endTurn();
  },

  declineBuy: () => {
    set({ modalData: null });
    get().endTurn();
  },

  payRent: () => {
    const { players, currentPlayerIndex, modalData } = get();
    if (!modalData?.owner || !modalData?.rent) return;
    const player = players[currentPlayerIndex];
    const rent = modalData.rent;
    const ownerId = modalData.owner.id;

    const updated = players.map((p) => {
      if (p.id === player.id) return { ...p, money: p.money - rent };
      if (p.id === ownerId) return { ...p, money: p.money + rent };
      return p;
    });
    get().addLog(`${player.name} → ${modalData.owner.name} 통행료 ${(rent / 10000).toFixed(0)}만원`);

    const updatedPlayer = updated.find((p) => p.id === player.id)!;
    if (updatedPlayer.money < 0) {
      const bankrupt = updated.map((p) => (p.id === player.id ? { ...p, isBankrupt: true } : p));
      get().addLog(`${player.name} 파산!`);
      set({ players: bankrupt, modalData: null, phase: 'GAME_OVER' });
      return;
    }

    set({ players: updated, modalData: null });
    get().endTurn();
  },

  handleGoldenKey: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const event = GOLDEN_KEY_EVENTS[Math.floor(Math.random() * GOLDEN_KEY_EVENTS.length)];
    const tile = BOARD_TILES[player.position];
    set({ phase: 'GOLDEN_KEY', modalData: { tile, goldenKeyEvent: event } });
  },

  confirmGoldenKey: () => {
    const { players, currentPlayerIndex, modalData } = get();
    if (!modalData?.goldenKeyEvent) return;
    const event = modalData.goldenKeyEvent;
    const player = players[currentPlayerIndex];

    if (event.effect.type === 'money') {
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, money: p.money + (event.effect.amount || 0) } : p
      );
      get().addLog(`${player.name} 황금열쇠: ${event.title} (${((event.effect.amount || 0) / 10000).toFixed(0)}만원)`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else if (event.effect.type === 'move') {
      const newPos = event.effect.position ?? 0;
      const bonus = event.effect.bonus ?? 0;
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, position: newPos, money: p.money + bonus } : p
      );
      get().addLog(`${player.name} 황금열쇠: ${event.title} → 이동`);
      set({ players: updated, modalData: null });
      // Re-trigger event for new tile
      const movedPlayer = updated.find((p) => p.id === player.id)!;
      const newTile = BOARD_TILES[movedPlayer.position];
      if (newTile.type === 'JAIL') {
        set({
          players: updated.map((p) => p.id === player.id ? { ...p, isJailed: true, jailTurns: 2 } : p),
        });
      }
      get().endTurn();
    } else if (event.effect.type === 'pay_all') {
      const amount = event.effect.amount || 0;
      const otherCount = players.filter((p) => p.id !== player.id && !p.isBankrupt).length;
      const updated = players.map((p) => {
        if (p.id === player.id) return { ...p, money: p.money - amount * otherCount };
        if (!p.isBankrupt) return { ...p, money: p.money + amount };
        return p;
      });
      get().addLog(`${player.name} 황금열쇠: ${event.title}`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else if (event.effect.type === 'collect_all') {
      const amount = event.effect.amount || 0;
      const otherCount = players.filter((p) => p.id !== player.id && !p.isBankrupt).length;
      const updated = players.map((p) => {
        if (p.id === player.id) return { ...p, money: p.money + amount * otherCount };
        if (!p.isBankrupt) return { ...p, money: p.money - amount };
        return p;
      });
      get().addLog(`${player.name} 황금열쇠: ${event.title}`);
      set({ players: updated, modalData: null });
      get().endTurn();
    }
  },

  handleJailEscape: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const BAIL = 200000;

    if (player.money >= BAIL) {
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, isJailed: false, jailTurns: 0, money: p.money - BAIL } : p
      );
      get().addLog(`${player.name} 보석금 ${(BAIL / 10000).toFixed(0)}만원으로 탈출`);
      set({ players: updated, modalData: null });
      get().endTurn();
    }
  },

  handleTax: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const tax = Math.floor(player.money * 0.1);
    const tile = BOARD_TILES[player.position];
    set({ phase: 'TAX', modalData: { tile, tax } });
  },

  handleWelfare: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const tile = BOARD_TILES[player.position];
    const welfare = tile.id === 15 ? 300000 : 500000;
    set({ phase: 'WELFARE', modalData: { tile, welfare } });
  },

  handleTravel: () => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const tile = BOARD_TILES[player.position];
    set({ phase: 'TRAVEL', modalData: { tile } });
  },

  confirmModal: () => {
    const { phase, players, currentPlayerIndex, modalData } = get();
    const player = players[currentPlayerIndex];

    if (phase === 'TAX') {
      const tax = modalData?.tax || 0;
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, money: p.money - tax } : p
      );
      get().addLog(`${player.name} 세금 ${(tax / 10000).toFixed(0)}만원 납부`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else if (phase === 'WELFARE') {
      const welfare = modalData?.welfare || 0;
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, money: p.money + welfare } : p
      );
      get().addLog(`${player.name} 사회복지기금 ${(welfare / 10000).toFixed(0)}만원 수령`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else if (phase === 'TRAVEL') {
      const randomPos = Math.floor(Math.random() * TOTAL_TILES);
      const updated = players.map((p) =>
        p.id === player.id ? { ...p, position: randomPos } : p
      );
      get().addLog(`${player.name} 우주여행으로 ${BOARD_TILES[randomPos].name}(으)로 이동!`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else if (phase === 'JAIL') {
      const updated = players.map((p) => {
        if (p.id !== player.id) return p;
        const newJailTurns = p.jailTurns - 1;
        return { ...p, jailTurns: newJailTurns, isJailed: newJailTurns > 0 };
      });
      get().addLog(`${player.name} 무인도 대기 (${updated.find(p => p.id === player.id)?.jailTurns ?? 0}턴 남음)`);
      set({ players: updated, modalData: null });
      get().endTurn();
    } else {
      set({ modalData: null });
      get().endTurn();
    }
  },

  buildHouse: (tileId) => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    const tile = BOARD_TILES[tileId];
    if (!tile.price) return;

    const prop = player.properties.find((p) => p.tileId === tileId);
    if (!prop || prop.houses >= 4) return;

    const houseCost = Math.floor(tile.price * 0.5);
    if (player.money < houseCost) return;

    const updated = players.map((p) => {
      if (p.id !== player.id) return p;
      return {
        ...p,
        money: p.money - houseCost,
        properties: p.properties.map((pr) =>
          pr.tileId === tileId ? { ...pr, houses: pr.houses + 1 } : pr
        ),
      };
    });
    get().addLog(`${player.name} ${tile.name}에 ${prop.houses + 1 <= 3 ? '집' : '호텔'} 건설`);
    set({ players: updated });
  },

  endTurn: () => {
    const { players, currentPlayerIndex, numPlayers } = get();
    const activePlayers = players.filter((p) => !p.isBankrupt);
    if (activePlayers.length <= 1) {
      set({ phase: 'GAME_OVER' });
      return;
    }

    let next = (currentPlayerIndex + 1) % numPlayers;
    let attempts = 0;
    while (players[next]?.isBankrupt && attempts < numPlayers) {
      next = (next + 1) % numPlayers;
      attempts++;
    }
    set({ currentPlayerIndex: next, phase: 'ROLL', movingPath: [] });
  },

  addLog: (msg) => {
    set((state) => ({ gameLog: [msg, ...state.gameLog].slice(0, 50) }));
  },
}));
