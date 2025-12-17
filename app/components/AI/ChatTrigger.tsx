import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChatOverlay } from "./ChatOverlay";

export default function ChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-9 w-9 rounded-lg shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatOverlay open={open} onOpenChange={setOpen} />
    </>
  );
}
