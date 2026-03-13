"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, Sword } from "lucide-react";

export default function GameSelectPage() {
  const router = useRouter();

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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl"
      >
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            게임을 선택하세요
          </h1>
          <p className="text-muted-foreground text-sm">
            플레이할 보드게임을 골라주세요
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* 부루마블 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => router.push("/game")}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Globe className="size-10 text-primary" />
            </div>
            <div className="relative space-y-1">
              <h2 className="text-2xl font-black text-primary tracking-wide">
                부루마블
              </h2>
              <p className="text-sm text-muted-foreground">
                세계 도시를 여행하며 부를 쌓는 보드게임
              </p>
            </div>
            <span className="relative text-sm font-bold text-primary/80 group-hover:text-primary">
              시작하기 →
            </span>
          </motion.button>

          {/* 조선비사 */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => router.push("/resistans_avalon")}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sword className="size-10 text-primary" />
            </div>
            <div className="relative space-y-1">
              <h2 className="text-2xl font-black text-primary tracking-wide">
                조선비사
              </h2>
              <p className="text-sm text-muted-foreground">
                정조 시대, 규장각 vs 노론 벽파의 대결을 배경으로 한 숨겨진 역할
                추리 게임
              </p>
            </div>
            <span className="relative text-sm font-bold text-primary/80 group-hover:text-primary">
              시작하기 →
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
