"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/use-game";
import { cn } from "@/lib/utils";
import { type Player } from "@/lib/game-store";
import { type ModalData } from "@/lib/game-engine";
import { type Tile } from "@/lib/game-data";

function fmt(n: number) {
  return `${(n / 10000).toFixed(0)}만원`;
}

// ── Modal shell ────────────────────────────────────────────────────────────────

export default function GameModal() {
  const {
    phase,
    modalData,
    players,
    currentPlayerIndex,
    buyProperty,
    declineBuy,
    payRent,
    confirmGoldenKey,
    handleJailEscape,
    confirmModal,
    isMyTurn,
    isMultiplayer,
  } = useGame();

  const showModal = [
    "BUY",
    "PAY_RENT",
    "GOLDEN_KEY",
    "JAIL",
    "TAX",
    "WELFARE",
    "TRAVEL",
    "GAME_OVER",
  ].includes(phase);
  // 멀티플레이에서 GAME_OVER는 모두에게 표시, 나머지는 내 턴일 때만
  const shouldShow =
    showModal && (phase === "GAME_OVER" || !isMultiplayer || isMyTurn);
  if (!shouldShow) return null;

  const player = players[currentPlayerIndex];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="bg-card border-2 border-border rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          {phase === "BUY" && modalData && (
            <BuyModal
              tile={modalData.tile}
              player={player}
              onBuy={buyProperty}
              onDecline={declineBuy}
            />
          )}
          {phase === "PAY_RENT" && modalData && (
            <RentModal
              tile={modalData.tile}
              owner={modalData.owner!}
              rent={modalData.rent!}
              player={player}
              onConfirm={payRent}
            />
          )}
          {phase === "GOLDEN_KEY" && modalData?.goldenKeyEvent && (
            <GoldenKeyModal
              event={modalData.goldenKeyEvent}
              onConfirm={confirmGoldenKey}
            />
          )}
          {phase === "JAIL" && modalData && (
            <JailModal
              player={player}
              onPay={handleJailEscape}
              onWait={confirmModal}
            />
          )}
          {phase === "TAX" && modalData && (
            <TaxModal tax={modalData.tax ?? 0} onConfirm={confirmModal} />
          )}
          {phase === "WELFARE" && modalData && (
            <WelfareModal
              welfare={modalData.welfare ?? 0}
              onConfirm={confirmModal}
            />
          )}
          {phase === "TRAVEL" && <TravelModal onConfirm={confirmModal} />}
          {phase === "GAME_OVER" && <GameOverModal players={players} />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Shared header ──────────────────────────────────────────────────────────────

function ModalHeader({
  label,
  title,
  bgColor,
}: {
  label: string;
  title: string;
  bgColor: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-xs font-black tracking-widest uppercase text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
        {label}
      </span>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
  );
}

function ActionBtn({
  onClick,
  disabled,
  variant = "primary",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "custom";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
        variant === "primary" &&
          !disabled &&
          "bg-primary text-primary-foreground hover:opacity-90",
        variant === "secondary" &&
          "border-2 border-border text-foreground hover:bg-muted",
        variant === "danger" &&
          !disabled &&
          "bg-rose-600 text-white hover:bg-rose-700",
        disabled &&
          "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
      )}
    >
      {children}
    </button>
  );
}

// ── Sub-modals ─────────────────────────────────────────────────────────────────

function BuyModal({
  tile,
  player,
  onBuy,
  onDecline,
}: {
  tile: Tile;
  player: Player;
  onBuy: () => void;
  onDecline: () => void;
}) {
  const canAfford = player.money >= (tile.price ?? 0);
  return (
    <>
      <ModalHeader
        label="도시 매수"
        title={`${tile.flag ?? ""} ${tile.name}`}
        bgColor={tile.color ?? "#3498db"}
      />
      <div className="p-5 flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">
          이 도시를 구매하시겠습니까?
        </p>
        <div className="bg-muted rounded-xl p-3 grid grid-cols-2 gap-3 text-sm">
          {[
            ["매수가", fmt(tile.price ?? 0)],
            ["기본 통행료", fmt(tile.rent ?? 0)],
            ["집 통행료", fmt(tile.houseRent ?? 0)],
            ["호텔 통행료", fmt(tile.hotelRent ?? 0)],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground">{k}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm bg-muted/50 px-3 py-2 rounded-lg">
          <span className="text-muted-foreground">현재 자금</span>
          <span
            className={cn(
              "font-bold",
              canAfford ? "text-green-400" : "text-destructive",
            )}
          >
            ₩{fmt(player.money)}
          </span>
        </div>
        <div className="flex gap-2">
          <ActionBtn onClick={onDecline} variant="secondary">
            거절
          </ActionBtn>
          <ActionBtn onClick={onBuy} disabled={!canAfford} variant="primary">
            {canAfford ? "매수하기" : "자금 부족"}
          </ActionBtn>
        </div>
      </div>
    </>
  );
}

function RentModal({
  tile,
  owner,
  rent,
  player,
  onConfirm,
}: {
  tile: Tile;
  owner: Player;
  rent: number;
  player: Player;
  onConfirm: () => void;
}) {
  return (
    <>
      <ModalHeader label="통행료" title="통행료 지불" bgColor="#c0392b" />
      <div className="p-5 flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-bold" style={{ color: owner.color }}>
            {owner.name}
          </span>
          의 {tile.flag} {tile.name}
        </p>
        <div className="bg-rose-950/40 border border-rose-700/40 rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">납부 통행료</div>
          <div className="text-4xl font-black text-rose-400">₩{fmt(rent)}</div>
        </div>
        <div className="flex justify-between text-sm bg-muted/50 px-3 py-2 rounded-lg">
          <span className="text-muted-foreground">납부 후 잔액</span>
          <span
            className={cn(
              "font-bold",
              player.money - rent < 0 ? "text-destructive" : "",
            )}
          >
            ₩{fmt(player.money - rent)}
          </span>
        </div>
        <ActionBtn onClick={onConfirm} variant="danger">
          통행료 납부
        </ActionBtn>
      </div>
    </>
  );
}

function GoldenKeyModal({
  event,
  onConfirm,
}: {
  event: NonNullable<ModalData["goldenKeyEvent"]> | null;
  onConfirm: () => void;
}) {
  if (!event) return null;
  const isGain =
    event.effect.type === "collect_all" ||
    (event.effect.type === "money" && (event.effect.amount ?? 0) > 0);

  return (
    <>
      <ModalHeader label="황금열쇠" title={event.title} bgColor="#d35400" />
      <div className="p-5 flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>
        {event.effect.type === "money" && (
          <div
            className={cn(
              "rounded-xl p-3 text-center font-black text-2xl",
              isGain
                ? "bg-green-950/40 border border-green-700/30 text-green-400"
                : "bg-rose-950/40 border border-rose-700/30 text-rose-400",
            )}
          >
            {(event.effect.amount ?? 0) > 0 ? "+" : ""}₩
            {fmt(event.effect.amount ?? 0)}
          </div>
        )}
        <ActionBtn onClick={onConfirm} variant="primary">
          확인
        </ActionBtn>
      </div>
    </>
  );
}

function JailModal({
  player,
  onPay,
  onWait,
}: {
  player: Player;
  onPay: () => void;
  onWait: () => void;
}) {
  const BAIL = 200000;
  const canPay = player.money >= BAIL;
  return (
    <>
      <ModalHeader label="무인도" title="무인도 도착!" bgColor="#334155" />
      <div className="p-5 flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">
          {player.isJailed
            ? `${player.jailTurns}턴 동안 무인도에 갇혀 있습니다.`
            : "무인도를 방문했습니다."}
        </p>
        {player.isJailed ? (
          <div className="flex gap-2">
            <ActionBtn onClick={onWait} variant="secondary">
              대기하기
            </ActionBtn>
            <ActionBtn onClick={onPay} disabled={!canPay} variant="primary">
              {canPay ? `보석금 ${fmt(BAIL)}` : "자금 부족"}
            </ActionBtn>
          </div>
        ) : (
          <ActionBtn onClick={onWait} variant="secondary">
            방문만 하기
          </ActionBtn>
        )}
      </div>
    </>
  );
}

function TaxModal({ tax, onConfirm }: { tax: number; onConfirm: () => void }) {
  return (
    <>
      <ModalHeader label="세금" title="세금 납부" bgColor="#b91c1c" />
      <div className="p-5 flex flex-col gap-4">
        <div className="bg-rose-950/40 border border-rose-700/40 rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">납부 금액</div>
          <div className="text-4xl font-black text-rose-400">₩{fmt(tax)}</div>
        </div>
        <ActionBtn onClick={onConfirm} variant="danger">
          세금 납부
        </ActionBtn>
      </div>
    </>
  );
}

function WelfareModal({
  welfare,
  onConfirm,
}: {
  welfare: number;
  onConfirm: () => void;
}) {
  return (
    <>
      <ModalHeader label="복지기금" title="사회복지기금" bgColor="#1d4ed8" />
      <div className="p-5 flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          사회복지기금에서 지원금을 받습니다!
        </p>
        <div className="bg-blue-950/40 border border-blue-700/40 rounded-xl p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">수령 금액</div>
          <div className="text-4xl font-black text-blue-400">
            +₩{fmt(welfare)}
          </div>
        </div>
        <ActionBtn onClick={onConfirm} variant="primary">
          수령하기
        </ActionBtn>
      </div>
    </>
  );
}

function TravelModal({ onConfirm }: { onConfirm: () => void }) {
  return (
    <>
      <ModalHeader label="우주여행" title="우주여행!" bgColor="#4338ca" />
      <div className="p-5 flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          무작위 도시로 순간이동합니다!
        </p>
        <ActionBtn onClick={onConfirm} variant="primary">
          출발하기!
        </ActionBtn>
      </div>
    </>
  );
}

function GameOverModal({ players }: { players: Player[] }) {
  const router = useRouter();
  const sorted = [...players].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return b.money - a.money;
  });
  const winner = sorted[0];

  return (
    <>
      <ModalHeader label="게임 종료" title="최종 결과" bgColor="#15803d" />
      <div className="p-5 flex flex-col gap-4">
        {winner && (
          <div className="text-center">
            <div
              className="text-3xl font-black mb-1"
              style={{ color: winner.color }}
            >
              {winner.name}
            </div>
            <div className="text-sm text-muted-foreground">우승!</div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
            >
              <span className="text-muted-foreground text-xs w-4 font-bold">
                {i + 1}
              </span>
              <div
                className="w-6 h-6 rounded-full border-2 border-white/80 flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.icon}
              </div>
              <span className="text-sm font-semibold flex-1">{p.name}</span>
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  p.isBankrupt ? "text-destructive" : "",
                )}
              >
                {p.isBankrupt ? "파산" : `₩${(p.money / 10000).toFixed(0)}만`}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          홈으로
        </button>
      </div>
    </>
  );
}
