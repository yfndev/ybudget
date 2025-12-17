"use client";

import MessageBubble from "@/components/AI/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { Bot, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AIPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.ai.mutations.sendMessage);

  const { results: messages } = useUIMessages(
    api.ai.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true }
  );

  const isStreaming = messages.some((m) => m.status === "streaming");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const prompt = input.trim();
    setInput("");
    const newThreadId = await sendMessage({
      threadId: threadId ?? undefined,
      prompt,
    });
    if (!threadId) setThreadId(newThreadId);
  };

  const startPrompts = [
    "Wie ist meine aktuelle Bilanz?",
    "Welche Projekte habe ich?",
    "Erkläre mir die Steuersphären",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Budget Assistent</h1>
      </div>

      <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
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
                  {startPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
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
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nachricht eingeben..."
              disabled={isStreaming}
              autoFocus
              className="flex-1"
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
      </div>
    </div>
  );
}
