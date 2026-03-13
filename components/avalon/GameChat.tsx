"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const CHAT_POLL_INTERVAL = 1500;
const API = "/api/avalon/games";

interface ChatMessage {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  message: string;
  createdAt: string;
}

interface GameChatProps {
  gameId: string;
  playerId: string;
  playerName: string;
  className?: string;
}

export function GameChat({
  gameId,
  playerId,
  playerName,
  className,
}: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/${gameId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setError(null);
      }
    } catch {
      setError("채팅을 불러올 수 없습니다.");
    }
  }, [gameId]);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, CHAT_POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    try {
      const res = await fetch(`${API}/${gameId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          playerName,
          message: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "전송 실패");
      }
      await fetchMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "전송 실패");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <MessageCircle className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">채팅</h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-[200px] max-h-[320px] overflow-y-auto p-3 space-y-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
      >
        {messages.length === 0 && !error && (
          <p className="text-sm text-muted-foreground text-center py-6">
            아직 메시지가 없습니다.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive text-center py-2">{error}</p>
        )}
        {messages.map((m) => {
          const isSystem = m.playerId === "system";
          const isMe = m.playerId === playerId;
          if (isSystem) {
            return (
              <div
                key={m.id}
                className="flex justify-center py-1"
              >
                <span className="text-xs text-muted-foreground">
                  {m.message}
                </span>
              </div>
            );
          }
          return (
            <div
              key={m.id}
              className={cn("flex flex-col gap-0.5", isMe && "items-end")}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isMe ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {m.playerName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(m.createdAt)}
                </span>
              </div>
              <div
                className={cn(
                  "text-sm px-3 py-1.5 rounded-lg max-w-[85%] break-words",
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.message}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 p-2 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 입력..."
          maxLength={500}
          disabled={sending}
          className="flex-1 text-sm"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
