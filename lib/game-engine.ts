/**
 * 서버용 순수 게임 로직 (REST API에서 사용)
 */
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
  houses: number;
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

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  diceValues: [number, number];
  diceRolling: boolean;
  modalData: ModalData | null;
  gameLog: string[];
  numPlayers: number;
  movingPath: number[];
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

function addLog(state: GameState, msg: string): GameState {
  return {
    ...state,
    gameLog: [msg, ...state.gameLog].slice(0, 50),
  };
}

function endTurn(state: GameState): GameState {
  const { players, currentPlayerIndex, numPlayers } = state;
  const activePlayers = players.filter((p) => !p.isBankrupt);
  if (activePlayers.length <= 1) {
    return { ...state, phase: 'GAME_OVER' };
  }

  let next = (currentPlayerIndex + 1) % numPlayers;
  let attempts = 0;
  while (players[next]?.isBankrupt && attempts < numPlayers) {
    next = (next + 1) % numPlayers;
    attempts++;
  }
  return { ...state, currentPlayerIndex: next, phase: 'ROLL', movingPath: [] };
}

export function createGame(numPlayers: number, names: string[]): GameState {
  return {
    players: createInitialPlayers(numPlayers, names),
    currentPlayerIndex: 0,
    phase: 'ROLL',
    diceValues: [1, 1],
    diceRolling: false,
    modalData: null,
    gameLog: ['게임이 시작되었습니다!'],
    numPlayers,
    movingPath: [],
  };
}

export function rollDice(state: GameState): GameState {
  const d1 = Math.ceil(Math.random() * 6);
  const d2 = Math.ceil(Math.random() * 6);
  const steps = d1 + d2;
  const player = state.players[state.currentPlayerIndex];
  const path: number[] = [];
  for (let i = 1; i <= steps; i++) {
    path.push((player.position + i) % TOTAL_TILES);
  }
  let next = addLog(state, `${player.name} 주사위: ${d1} + ${d2} = ${steps}`);
  return {
    ...next,
    diceValues: [d1, d2],
    diceRolling: true,
    phase: 'MOVING',
    movingPath: path,
  };
}

export function movePlayer(state: GameState, playerId: number, steps: number): GameState {
  const updated = state.players.map((p) => {
    if (p.id !== playerId) return p;
    const oldPos = p.position;
    const newPos = (p.position + steps) % TOTAL_TILES;
    const passedStart = newPos < oldPos || (oldPos === 0 && steps > 0);
    return { ...p, position: newPos, money: passedStart ? p.money + 200000 : p.money };
  });
  return { ...state, players: updated };
}

export function finishMoving(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  const tile = BOARD_TILES[player.position];

  if (player.isJailed) {
    return { ...state, phase: 'JAIL', modalData: { tile } };
  }

  switch (tile.type) {
    case 'START': {
      let s = addLog(state, `${player.name} 출발! +200,000원`);
      s = {
        ...s,
        players: s.players.map((p) =>
          p.id === player.id ? { ...p, money: p.money + 200000 } : p
        ),
      };
      return endTurn(s);
    }
    case 'CITY': {
      const owner = state.players.find((p) => p.properties.some((pr) => pr.tileId === tile.id));
      if (!owner) {
        return { ...state, phase: 'BUY', modalData: { tile } };
      }
      if (owner.id === player.id) {
        return endTurn(addLog(state, `${player.name} 본인 소유지 통과`));
      }
      const prop = owner.properties.find((pr) => pr.tileId === tile.id)!;
      const rentTable = [tile.rent || 0, tile.houseRent || 0, tile.houseRent || 0, tile.houseRent || 0, tile.hotelRent || 0];
      const rent = rentTable[Math.min(prop.houses, 4)];
      return { ...state, phase: 'PAY_RENT', modalData: { tile, owner, rent } };
    }
    case 'KEY': {
      const event = GOLDEN_KEY_EVENTS[Math.floor(Math.random() * GOLDEN_KEY_EVENTS.length)];
      return { ...state, phase: 'GOLDEN_KEY', modalData: { tile, goldenKeyEvent: event } };
    }
    case 'JAIL': {
      const s = addLog(state, `${player.name} 무인도로! 2턴 대기`);
      return {
        ...s,
        players: s.players.map((p) =>
          p.id === player.id ? { ...p, isJailed: true, jailTurns: 2 } : p
        ),
        phase: 'JAIL',
        modalData: { tile },
      };
    }
    case 'WELFARE': {
      const welfare = tile.id === 15 ? 300000 : 500000;
      return { ...state, phase: 'WELFARE', modalData: { tile, welfare } };
    }
    case 'TAX': {
      const tax = Math.floor(player.money * 0.1);
      return { ...state, phase: 'TAX', modalData: { tile, tax } };
    }
    case 'TRAVEL':
      return { ...state, phase: 'TRAVEL', modalData: { tile } };
    default:
      return endTurn(state);
  }
}

export function buyProperty(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  const modalData = state.modalData;
  if (!modalData?.tile?.price) return state;

  if (player.money < modalData.tile.price) {
    return endTurn(addLog(state, `${player.name} 자금 부족으로 구매 불가`));
  }

  const updated = state.players.map((p) => {
    if (p.id !== player.id) return p;
    return {
      ...p,
      money: p.money - modalData.tile.price!,
      properties: [...p.properties, { tileId: modalData.tile.id, houses: 0 }],
    };
  });
  let s = addLog(state, `${player.name} ${modalData.tile.name} 구매 (${(modalData.tile.price / 10000).toFixed(0)}만원)`);
  return endTurn({ ...s, players: updated, modalData: null });
}

export function declineBuy(state: GameState): GameState {
  return endTurn({ ...state, modalData: null });
}

export function payRent(state: GameState): GameState {
  const modalData = state.modalData;
  if (!modalData?.owner || !modalData?.rent) return state;
  const player = state.players[state.currentPlayerIndex];
  const rent = modalData.rent;
  const ownerId = modalData.owner.id;

  const updated = state.players.map((p) => {
    if (p.id === player.id) return { ...p, money: p.money - rent };
    if (p.id === ownerId) return { ...p, money: p.money + rent };
    return p;
  });
  let s = addLog(state, `${player.name} → ${modalData.owner.name} 통행료 ${(rent / 10000).toFixed(0)}만원`);

  const updatedPlayer = updated.find((p) => p.id === player.id)!;
  if (updatedPlayer.money < 0) {
    const bankrupt = updated.map((p) => (p.id === player.id ? { ...p, isBankrupt: true } : p));
    return { ...addLog(s, `${player.name} 파산!`), players: bankrupt, modalData: null, phase: 'GAME_OVER' };
  }
  return endTurn({ ...s, players: updated, modalData: null });
}

export function confirmGoldenKey(state: GameState): GameState {
  const modalData = state.modalData;
  if (!modalData?.goldenKeyEvent) return state;
  const event = modalData.goldenKeyEvent;
  const player = state.players[state.currentPlayerIndex];
  const players = state.players;

  if (event.effect.type === 'money') {
    const amount = event.effect.amount || 0;
    const updated = players.map((p) =>
      p.id === player.id ? { ...p, money: p.money + amount } : p
    );
    let s = addLog(state, `${player.name} 황금열쇠: ${event.title} (${(amount / 10000).toFixed(0)}만원)`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (event.effect.type === 'move') {
    const newPos = event.effect.position ?? 0;
    const bonus = event.effect.bonus ?? 0;
    const updated = players.map((p) =>
      p.id === player.id ? { ...p, position: newPos, money: p.money + bonus } : p
    );
    let s = addLog(state, `${player.name} 황금열쇠: ${event.title} → 이동`);
    const movedPlayer = updated.find((p) => p.id === player.id)!;
    const newTile = BOARD_TILES[movedPlayer.position];
    if (newTile.type === 'JAIL') {
      const withJail = updated.map((p) =>
        p.id === player.id ? { ...p, isJailed: true, jailTurns: 2 } : p
      );
      return endTurn({ ...s, players: withJail, modalData: null });
    }
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (event.effect.type === 'pay_all') {
    const amount = event.effect.amount || 0;
    const otherCount = players.filter((p) => p.id !== player.id && !p.isBankrupt).length;
    const updated = players.map((p) => {
      if (p.id === player.id) return { ...p, money: p.money - amount * otherCount };
      if (!p.isBankrupt) return { ...p, money: p.money + amount };
      return p;
    });
    let s = addLog(state, `${player.name} 황금열쇠: ${event.title}`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (event.effect.type === 'collect_all') {
    const amount = event.effect.amount || 0;
    const otherCount = players.filter((p) => p.id !== player.id && !p.isBankrupt).length;
    const updated = players.map((p) => {
      if (p.id === player.id) return { ...p, money: p.money + amount * otherCount };
      if (!p.isBankrupt) return { ...p, money: p.money - amount };
      return p;
    });
    let s = addLog(state, `${player.name} 황금열쇠: ${event.title}`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  return state;
}

export function handleJailEscape(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  const BAIL = 200000;
  if (player.money < BAIL) return state;

  const updated = state.players.map((p) =>
    p.id === player.id ? { ...p, isJailed: false, jailTurns: 0, money: p.money - BAIL } : p
  );
  let s = addLog(state, `${player.name} 보석금 ${(BAIL / 10000).toFixed(0)}만원으로 탈출`);
  return endTurn({ ...s, players: updated, modalData: null });
}

export function confirmModal(state: GameState): GameState {
  const { phase, players, currentPlayerIndex, modalData } = state;
  const player = players[currentPlayerIndex];

  if (phase === 'TAX') {
    const tax = modalData?.tax || 0;
    const updated = players.map((p) =>
      p.id === player.id ? { ...p, money: p.money - tax } : p
    );
    let s = addLog(state, `${player.name} 세금 ${(tax / 10000).toFixed(0)}만원 납부`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (phase === 'WELFARE') {
    const welfare = modalData?.welfare || 0;
    const updated = players.map((p) =>
      p.id === player.id ? { ...p, money: p.money + welfare } : p
    );
    let s = addLog(state, `${player.name} 사회복지기금 ${(welfare / 10000).toFixed(0)}만원 수령`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (phase === 'TRAVEL') {
    const randomPos = Math.floor(Math.random() * TOTAL_TILES);
    const updated = players.map((p) =>
      p.id === player.id ? { ...p, position: randomPos } : p
    );
    let s = addLog(state, `${player.name} 우주여행으로 ${BOARD_TILES[randomPos].name}(으)로 이동!`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  if (phase === 'JAIL') {
    const updated = players.map((p) => {
      if (p.id !== player.id) return p;
      const newJailTurns = p.jailTurns - 1;
      return { ...p, jailTurns: newJailTurns, isJailed: newJailTurns > 0 };
    });
    const jt = updated.find((p) => p.id === player.id)?.jailTurns ?? 0;
    let s = addLog(state, `${player.name} 무인도 대기 (${jt}턴 남음)`);
    return endTurn({ ...s, players: updated, modalData: null });
  }
  return endTurn({ ...state, modalData: null });
}

export function buildHouse(state: GameState, tileId: number): GameState {
  const player = state.players[state.currentPlayerIndex];
  const tile = BOARD_TILES[tileId];
  if (!tile.price) return state;

  const prop = player.properties.find((p) => p.tileId === tileId);
  if (!prop || prop.houses >= 4) return state;

  const houseCost = Math.floor(tile.price * 0.5);
  if (player.money < houseCost) return state;

  const updated = state.players.map((p) => {
    if (p.id !== player.id) return p;
    return {
      ...p,
      money: p.money - houseCost,
      properties: p.properties.map((pr) =>
        pr.tileId === tileId ? { ...pr, houses: pr.houses + 1 } : pr
      ),
    };
  });
  return addLog(
    { ...state, players: updated },
    `${player.name} ${tile.name}에 ${prop.houses + 1 <= 3 ? '집' : '호텔'} 건설`
  );
}
