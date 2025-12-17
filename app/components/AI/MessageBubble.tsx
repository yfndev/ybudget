import { cn } from "@/lib/utils";
import { useSmoothText } from "@convex-dev/agent/react";
import { Bot, User } from "lucide-react";

export default function MessageBubble({
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
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{smoothText || text}</p>
      </div>
    </div>
  );
}
