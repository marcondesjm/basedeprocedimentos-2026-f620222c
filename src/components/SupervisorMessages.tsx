import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupervisorMessage {
  id: string;
  message: string;
  created_at: string;
}

export const SupervisorMessages = () => {
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("supervisor_messages" as any)
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setMessages(data as any as SupervisorMessage[]);
    };

    fetchMessages();

    const channel = supabase
      .channel("supervisor_messages_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "supervisor_messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Rotate messages every 15 seconds
  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 800);
    }, 15000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const current = messages[currentIndex];

  return (
    <Card className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 flex items-center gap-4 overflow-hidden">
      <div className="shrink-0 text-primary">
        <Megaphone className="w-6 h-6" />
      </div>
      {current ? (
        <p
          className="text-sm md:text-base font-medium text-foreground/80"
          style={{
            transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(-8px)",
          }}
        >
          📢 {current.message}
        </p>
      ) : (
        <p className="text-sm md:text-base text-muted-foreground italic">
          Nenhum aviso dos supervisores no momento.
        </p>
      )}
      {messages.length > 1 && (
        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
          {currentIndex + 1}/{messages.length}
        </span>
      )}
    </Card>
  );
};
