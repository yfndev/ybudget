"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useSmoothText, useUIMessages } from "@convex-dev/agent/react";
import { useAction } from "convex/react";
import { Bot, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STARTERS = [
  "Was sind meine größten Ausgaben?",
  "Wo kann ich Kosten sparen?",
  "Erstelle einen Finanzreport",
  "Wie ist meine aktuelle Bilanz?",
];

function LoadingDots({ size = "md" }: { size?: "sm" | "md" }) {
  const dotSize = size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5";
  return (
    <div className="flex gap-0.5">
      <span className={cn(dotSize, "bg-current rounded-full animate-bounce [animation-delay:-0.3s]")} />
      <span className={cn(dotSize, "bg-current rounded-full animate-bounce [animation-delay:-0.15s]")} />
      <span className={cn(dotSize, "bg-current rounded-full animate-bounce")} />
    </div>
  );
}

function MessageBubble({ role, text, isStreaming }: { role: "user" | "assistant"; text: string; isStreaming?: boolean }) {
  const [smoothText] = useSmoothText(text, { startStreaming: isStreaming ?? false });
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser && "justify-end")}>
      <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
        <p className="text-sm whitespace-pre-wrap">{smoothText || text}</p>
      </div>
    </div>
  );
}

export function ChatOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useAction(api.ai.actions.sendMessage);

  const { results: messages } = useUIMessages(
    api.ai.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true }
  );

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, pending]);

  useEffect(() => {
    if (pending && messages.some((msg) => msg.role === "user" && msg.text === pending)) {
      setPending(null);
    }
  }, [messages, pending]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || pending) return;
    const text = prompt.trim();
    setInput("");
    setPending(text);
    const newId = await sendMessage({ threadId: threadId ?? undefined, prompt: text });
    if (!threadId) setThreadId(newId);
  };

  const isEmpty = messages.length === 0 && !pending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Budgy
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {isEmpty && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Hallo! Ich bin Budgy, dein Budget-Assistent.</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Frag mich zu Transaktionen, Kategorien oder Finanzen.</p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((starter) => (
                    <Button key={starter} variant="outline" size="sm" className="text-left justify-start h-auto py-2 px-3" onClick={() => send(starter)}>
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) =>
              msg.text ? <MessageBubble key={msg.key} role={msg.role as "user" | "assistant"} text={msg.text} isStreaming={msg.status === "streaming"} /> : null
            )}

            {pending && (
              <>
                <MessageBubble role="user" text={pending} />
                <div className="flex">
                  <div className="rounded-lg px-4 py-2 bg-muted text-muted-foreground">
                    <LoadingDots />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t p-4">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nachricht eingeben..." disabled={!!pending} autoFocus />
            <Button type="submit" size="icon" disabled={!!pending || !input.trim()}>
              {pending ? <LoadingDots size="sm" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 h-9 w-9 rounded-lg shadow-lg z-50" size="icon">
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatOverlay open={open} onOpenChange={setOpen} />
    </>
  );
}
