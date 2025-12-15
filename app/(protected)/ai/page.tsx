"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { useUIMessages, useSmoothText } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

function MessageBubble({
  role,
  text,
  isStreaming,
}: {
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
}) {
  const [smoothText] = useSmoothText(text, {
    startStreaming: isStreaming ?? false,
  });

  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{smoothText || text}</p>
      </div>
    </div>
  );
}

export default function AIPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useAction(api.ai.actions.sendMessage);

  const { results: messages } = useUIMessages(
    api.ai.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const newThreadId = await sendMessage({
        threadId: threadId ?? undefined,
        prompt,
      });
      if (!threadId) setThreadId(newThreadId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Budget Assistent</h1>
      </div>

      <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Hallo! Ich bin dein Budget-Assistent.
                </p>
                <p className="mt-2">
                  Frag mich zu Transaktionen, Kategorien, Steuersphären oder
                  deinen Finanzen.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Wie ist meine aktuelle Bilanz?",
                    "Welche Projekte habe ich?",
                    "Erkläre mir die Steuersphären",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.key}
                role={message.role as "user" | "assistant"}
                text={message.text ?? ""}
                isStreaming={message.status === "streaming"}
              />
            ))}
            {isLoading && messages.length === 0 && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nachricht eingeben..."
              disabled={isLoading}
              autoFocus
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
