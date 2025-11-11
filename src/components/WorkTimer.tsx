import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Play, Pause, RotateCcw, AlertCircle, Plus, Trash2, CheckCircle } from "lucide-react";

interface WorkOrder {
  id: string;
  number: string;
  totalSeconds: number;
  isRunning: boolean;
  hasFinished: boolean;
  hasWarned: boolean;
  startTime?: number;
  pausedTime?: number;
}

export const WorkTimer = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [newWO, setNewWO] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setWorkOrders((orders) =>
        orders.map((wo) => {
          if (!wo.isRunning || wo.hasFinished || !wo.startTime) return wo;

          const elapsed = Math.floor((now - wo.startTime) / 1000);
          const timeLeft = Math.max(0, wo.totalSeconds - elapsed);

          // Aviso aos 5 minutos restantes (300 segundos)
          if (timeLeft <= 300 && timeLeft > 295 && !wo.hasWarned) {
            toast.warning(`⏰ WO ${wo.number}: Faltam 5 minutos!`, {
              description: "Prepare-se para adicionar uma nova nota no sistema.",
              duration: 10000,
            });
            return { ...wo, hasWarned: true };
          }

          // Timer finalizado
          if (timeLeft === 0 && !wo.hasFinished) {
            playAlert();
            toast.error(`⏰ WO ${wo.number}: Tempo Esgotado!`, {
              description: "Adicione uma nova nota no sistema agora!",
              duration: 15000,
            });
            return { ...wo, isRunning: false, hasFinished: true };
          }

          return wo;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const playAlert = () => {
    // Cria um alerta sonoro usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Repete o som 3 vezes
    setTimeout(() => playBeep(audioContext), 600);
    setTimeout(() => playBeep(audioContext), 1200);
  };

  const playBeep = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const addWorkOrder = () => {
    if (!newWO.trim()) {
      toast.error("Digite o número da WO");
      return;
    }

    const exists = workOrders.some(wo => wo.number === newWO.trim());
    if (exists) {
      toast.error("Esta WO já está na lista");
      return;
    }

    const newOrder: WorkOrder = {
      id: Date.now().toString(),
      number: newWO.trim(),
      totalSeconds: 40 * 60,
      isRunning: false,
      hasFinished: false,
      hasWarned: false,
    };

    setWorkOrders([...workOrders, newOrder]);
    setNewWO("");
    toast.success(`WO ${newOrder.number} adicionada!`);
  };

  const removeWorkOrder = (id: string) => {
    setWorkOrders(workOrders.filter(wo => wo.id !== id));
    toast.success("WO removida");
  };

  const toggleTimer = (id: string) => {
    const now = Date.now();
    setWorkOrders(
      workOrders.map((wo) => {
        if (wo.id !== id) return wo;
        
        if (wo.isRunning) {
          // Pausando: calcular tempo decorrido e atualizar totalSeconds
          const elapsed = wo.startTime ? Math.floor((now - wo.startTime) / 1000) : 0;
          const newTotal = Math.max(0, wo.totalSeconds - elapsed);
          return {
            ...wo,
            isRunning: false,
            totalSeconds: newTotal,
            pausedTime: now,
            startTime: undefined,
          };
        } else {
          // Iniciando/retomando
          return {
            ...wo,
            isRunning: true,
            startTime: now,
          };
        }
      })
    );
  };

  const resetTimer = (id: string) => {
    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              totalSeconds: 40 * 60,
              isRunning: false,
              hasFinished: false,
              hasWarned: false,
              startTime: undefined,
              pausedTime: undefined,
            }
          : wo
      )
    );
    toast.success("Timer reiniciado!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeLeft = (wo: WorkOrder): number => {
    if (!wo.isRunning || !wo.startTime) return wo.totalSeconds;
    const elapsed = Math.floor((Date.now() - wo.startTime) / 1000);
    return Math.max(0, wo.totalSeconds - elapsed);
  };

  const getProgress = (wo: WorkOrder) => {
    const timeLeft = getTimeLeft(wo);
    return ((40 * 60 - timeLeft) / (40 * 60)) * 100;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Timer de Ordens de Serviço</h3>
        </div>

        {/* Adicionar nova WO */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Digite o número da WO"
              value={newWO}
              onChange={(e) => setNewWO(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWorkOrder()}
            />
          </div>
          <Button onClick={addWorkOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Lista de WOs */}
        {workOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma ordem de serviço adicionada</p>
            <p className="text-xs mt-1">Adicione WOs para iniciar a contagem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <Card key={wo.id} className="p-4 bg-background/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={wo.hasFinished ? "destructive" : wo.isRunning ? "default" : "secondary"}>
                        WO {wo.number}
                      </Badge>
                      {wo.hasFinished && (
                        <CheckCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkOrder(wo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold tabular-nums ${
                        wo.hasFinished
                          ? "text-destructive animate-pulse"
                          : getTimeLeft(wo) <= 300
                          ? "text-orange-500"
                          : "text-primary"
                      }`}
                    >
                      {formatTime(getTimeLeft(wo))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {wo.hasFinished
                        ? "⏰ Tempo esgotado! Adicione uma nota."
                        : getTimeLeft(wo) <= 300
                        ? "⚠️ Últimos 5 minutos!"
                        : wo.isRunning
                        ? "Em andamento"
                        : "Pausado"}
                    </p>
                  </div>

                  <Progress value={getProgress(wo)} className="h-1.5" />

                  <div className="flex gap-2">
                    {wo.hasFinished ? (
                      <Button
                        onClick={() => resetTimer(wo.id)}
                        size="sm"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reiniciar
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => toggleTimer(wo.id)}
                          size="sm"
                          variant={wo.isRunning ? "outline" : "default"}
                          className="flex-1"
                        >
                          {wo.isRunning ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Iniciar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => resetTimer(wo.id)}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {getTimeLeft(wo) <= 300 && getTimeLeft(wo) > 0 && !wo.hasFinished && (
                    <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <p className="text-orange-700 dark:text-orange-300">
                        Prepare uma nova nota!
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
