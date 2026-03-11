import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Megaphone, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SupervisorMessage {
  id: string;
  message: string;
  details: string | null;
  created_at: string;
}

export const SupervisorMessages = () => {
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupervisorMessage | null>(null);

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
    const refreshTimer = setInterval(fetchMessages, 2 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, []);

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
    <>
      <Card className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 text-primary">
          <Megaphone className="w-6 h-6" />
        </div>
        {current ? (
          <>
            <p
              className="text-sm md:text-base font-medium text-foreground/80 flex-1 min-w-0"
              style={{
                transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-8px)",
              }}
            >
              📢 {current.message}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary shrink-0"
              style={{
                transition: "opacity 0.8s ease-in-out",
                opacity: isVisible ? 1 : 0,
              }}
              onClick={() => setSelectedMessage(current)}
            >
              <Info className="w-3.5 h-3.5" />
              Saiba mais
            </Button>
          </>
        ) : (
          <p className="text-sm md:text-base text-muted-foreground italic">
            Nenhum aviso dos supervisores no momento.
          </p>
        )}
        {messages.length > 1 && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {currentIndex + 1}/{messages.length}
          </span>
        )}
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Megaphone className="w-5 h-5" />
              Aviso do Supervisor
            </DialogTitle>
            <DialogDescription className="sr-only">Detalhes do aviso</DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-foreground">📢 {selectedMessage.message}</p>
              </div>
              {selectedMessage.details && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMessage.details}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Publicado em: {format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
