"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { Bot, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LoadingDots } from "./LoadingDots";
import { RenderAIText } from "./RenderAIText";

const STARTERS = [
  "Was waren die 10 größten Ausgaben dieses Jahr?",
  "Liste alle offenen Posten auf",
  "Liste alle offenen Erstattungen auf",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatOverlay({ open, onOpenChange }: Props) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.ai.mutations.sendMessage);

  const { results: messages } = useUIMessages(
    api.ai.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const isStreaming = messages.some((msg) => msg.status === "streaming");

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || isStreaming) return;
    setInput("");
    const newThreadId = await sendMessage({
      threadId: threadId ?? undefined,
      prompt: prompt.trim(),
    });
    if (!threadId) setThreadId(newThreadId);
  };

  const isEmpty = messages.length === 0;

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
                <p className="text-sm text-muted-foreground">
                  Hallo! Ich bin Budgy, dein Budget-Assistent.
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Frag mich zu Transaktionen, Kategorien oder Finanzen.
                </p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((starter) => (
                    <Button
                      key={starter}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3"
                      onClick={() => send(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages
              .filter(
                (message) =>
                  message.role === "user" || message.role === "assistant",
              )
              .map((message) => (
                <div
                  key={message.key}
                  className={cn(
                    "flex",
                    message.role === "user" && "justify-end",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {message.text ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {RenderAIText(message.text)}
                        {message.status === "streaming" && (
                          <span className="animate-pulse">▊</span>
                        )}
                      </p>
                    ) : message.status === "streaming" ? (
                      <LoadingDots />
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t p-4"
        >
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Nachricht eingeben..."
              disabled={isStreaming}
              autoFocus
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isStreaming || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
