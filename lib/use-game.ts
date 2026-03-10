"use client";

import { useMemo } from "react";
import { useGameStore } from "./game-store";
import { useMultiplayerGame } from "./multiplayer-context";

/**
 * 로컬 또는 멀티플레이 모드에 따라 통일된 게임 인터페이스 제공
 */
export function useGame() {
  const multiplayer = useMultiplayerGame();
  const local = useGameStore();

  return useMemo(() => {
    if (multiplayer) {
      const s = multiplayer.state;
      if (!s) {
        return {
          players: [],
          currentPlayerIndex: 0,
          phase: "SETUP" as const,
          diceValues: [1, 1] as [number, number],
          diceRolling: false,
          modalData: null,
          gameLog: [],
          numPlayers: 0,
          movingPath: [],
          isMultiplayer: true,
          isMyTurn: false,
          error: multiplayer.error,
          isLoading: multiplayer.isLoading,
          rollDice: () => {},
          setDiceRolling: () => {},
          movePlayer: () => {},
          setMovingPath: () => {},
          finishMoving: () => {},
          buyProperty: () => {},
          declineBuy: () => {},
          payRent: () => {},
          handleGoldenKey: () => {},
          handleJailEscape: () => {},
          handleTax: () => {},
          handleWelfare: () => {},
          handleTravel: () => {},
          confirmModal: () => {},
          buildHouse: () => {},
          initGame: () => {},
          resetToSetup: () => {},
          endTurn: () => {},
          addLog: () => {},
          setState: () => {},
        };
      }
      return {
        // State
        players: s.players,
        currentPlayerIndex: s.currentPlayerIndex,
        phase: s.phase,
        diceValues: s.diceValues,
        diceRolling: s.diceRolling,
        modalData: s.modalData,
        gameLog: s.gameLog,
        numPlayers: s.numPlayers,
        movingPath: s.movingPath,

        // Multiplayer meta
        isMultiplayer: true,
        isMyTurn: multiplayer.isMyTurn,
        error: multiplayer.error,
        isLoading: multiplayer.isLoading,

        // Actions (delegate to API)
        rollDice: () => multiplayer.act({ action: "roll" }),
        setDiceRolling: (v: boolean) =>
          multiplayer.setState({ diceRolling: v }),
        movePlayer: (playerId: number, steps: number) =>
          multiplayer.act({ action: "move", payload: { steps } }),
        setMovingPath: (path: number[]) =>
          multiplayer.setState({ movingPath: path }),
        finishMoving: () => multiplayer.act({ action: "finishMoving" }),
        buyProperty: () => multiplayer.act({ action: "buy" }),
        declineBuy: () => multiplayer.act({ action: "decline" }),
        payRent: () => multiplayer.act({ action: "payRent" }),
        handleGoldenKey: () => multiplayer.act({ action: "confirmGoldenKey" }),
        handleJailEscape: () => multiplayer.act({ action: "jailEscape" }),
        handleTax: () => {},
        handleWelfare: () => {},
        handleTravel: () => {},
        confirmModal: () => multiplayer.act({ action: "confirmModal" }),
        buildHouse: (tileId: number) =>
          multiplayer.act({ action: "buildHouse", payload: { tileId } }),
        initGame: () => {},
        resetToSetup: () => {},
        endTurn: () => {},
        addLog: () => {},

        // For animation - update local state
        setState: multiplayer.setState,
      };
    }

    return {
      ...local,
      isMultiplayer: false,
      isMyTurn: true,
      error: null,
      isLoading: false,
      setState: (partial: object | ((s: never) => object)) =>
        (useGameStore.setState as (u: object | ((s: never) => object)) => void)(
          partial,
        ),
    };
  }, [multiplayer, local]);
}
