"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createGame, joinGame } from "@/lib/game-api";
import { PLAYER_COLORS, PLAYER_ICONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Users, LogIn } from "lucide-react";

type Tab = "create" | "join";

export default function SetupScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("create");
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState([
    "플레이어 1",
    "플레이어 2",
    "플레이어 3",
    "플레이어 4",
  ]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const { gameId } = await createGame(
        numPlayers,
        names.slice(0, numPlayers),
      );
      router.push(`/game/${gameId}?p=0`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "게임 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setError("");
    setLoading(true);
    try {
      const { gameId } = await joinGame(joinCode.trim().toUpperCase());
      router.push(`/game/${gameId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "참가 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center"
          >
            <span className="text-5xl">🌍</span>
          </motion.div>
          <h1 className="text-5xl font-black text-primary tracking-widest drop-shadow-lg mt-2">
            부루마블
          </h1>
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
            멀티플레이
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 w-full">
          <button
            onClick={() => setTab("create")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all",
              tab === "create"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 border-transparent hover:border-primary/40",
            )}
          >
            <Users size={18} />방 만들기
          </button>
          <button
            onClick={() => setTab("join")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all",
              tab === "join"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 border-transparent hover:border-primary/40",
            )}
          >
            <LogIn size={18} />방 참가
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-5"
        >
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {tab === "create" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                  플레이어 수
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumPlayers(n)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all duration-200",
                        numPlayers === n
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : "bg-muted text-muted-foreground border-transparent hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {n}명
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  플레이어 이름
                </label>
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-lg shrink-0 shadow-sm"
                      style={{ backgroundColor: PLAYER_COLORS[i] }}
                    >
                      {PLAYER_ICONS[i]}
                    </div>
                    <input
                      type="text"
                      value={names[i]}
                      onChange={(e) => {
                        const next = [...names];
                        next[i] = e.target.value;
                        setNames(next);
                      }}
                      maxLength={10}
                      placeholder={`플레이어 ${i + 1}`}
                      className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleCreate}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg tracking-wider shadow-lg hover:opacity-90 transition-opacity mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "생성 중..." : "방 만들기"}
              </motion.button>
            </>
          )}

          {tab === "join" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                  방 코드
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="예: ABC123"
                  maxLength={6}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-lg font-mono font-bold text-center tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <motion.button
                onClick={handleJoin}
                disabled={loading || joinCode.length < 4}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg tracking-wider shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "참가 중..." : "참가하기"}
              </motion.button>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-card/50 border border-border/50 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed"
        >
          <p className="font-bold text-foreground mb-2 text-sm">
            게임 규칙 요약
          </p>
          <ul className="flex flex-col gap-1 list-disc list-inside">
            <li>시작 자금 200만원으로 시작합니다</li>
            <li>출발 칸 통과 시 20만원을 받습니다</li>
            <li>도시를 매수하고 집/호텔을 건설하세요</li>
            <li>황금열쇠를 뽑으면 이벤트가 발생합니다</li>
            <li>무인도에 갇히면 2턴을 기다립니다 (보석금 20만원)</li>
            <li>파산하면 게임에서 탈락합니다</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
