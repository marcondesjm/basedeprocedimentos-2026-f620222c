import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Play, RotateCcw, AlertCircle, Plus, Trash2, CheckCircle, Image as ImageIcon, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

interface WorkOrder {
  id: string;
  number: string;
  elapsedSeconds: number; // accumulated elapsed time when paused
  limitSeconds: number; // alarm threshold (default 40min)
  isRunning: boolean;
  hasFinished: boolean;
  hasWarned: boolean;
  showGuidance: boolean;
  startTime?: number; // timestamp when timer was last started
  images: string[];
}

export const WorkTimer = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [newWO, setNewWO] = useState("");
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setWorkOrders((orders) =>
        orders.map((wo) => {
          if (!wo.isRunning || wo.hasFinished || !wo.startTime) return wo;

          const currentElapsed = wo.elapsedSeconds + Math.floor((now - wo.startTime) / 1000);

          // Aviso aos 35 minutos (5 min antes do limite)
          const warnAt = wo.limitSeconds - 300;
          if (currentElapsed >= warnAt && currentElapsed < warnAt + 5 && !wo.hasWarned) {
            toast.warning(`⏰ WO ${wo.number}: Faltam 5 minutos!`, {
              description: "Prepare-se para inserir uma nota no Remedy.",
              duration: 10000,
            });
            return { ...wo, hasWarned: true };
          }

          // Timer atingiu o limite
          if (currentElapsed >= wo.limitSeconds && !wo.hasFinished) {
            startContinuousAlarm(wo.number);
            toast.error(`⏰ WO ${wo.number}: 40 minutos atingidos!`, {
              description: "Insira uma nota no Remedy agora!",
              duration: 30000,
            });
            return { ...wo, hasFinished: true };
          }

          return wo;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const playBeep = () => {
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
  };

  const startContinuousAlarm = (woNumber: string) => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
    }

    playBeep();

    const intervalId = setInterval(() => {
      playBeep();
    }, 2000);

    alarmIntervalRef.current = intervalId;
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setSelectedImages([...selectedImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const downloadImage = (imageData: string, woNumber: string, imageIndex: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `WO_${woNumber}_imagem_${imageIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Imagem baixada!");
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
      elapsedSeconds: 0,
      limitSeconds: 20,
      isRunning: true,
      hasFinished: false,
      hasWarned: false,
      showGuidance: false,
      startTime: Date.now(),
      images: selectedImages,
    };

    setWorkOrders([...workOrders, newOrder]);
    setNewWO("");
    toast.success(`WO ${newOrder.number} adicionada!`);
  };

  const saveCompletedWorkOrder = (wo: WorkOrder, woNotes?: string) => {
    try {
      const now = new Date();
      const dateKey = format(now, 'yyyy-MM-dd');
      
      // Get existing history from localStorage
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      
      // Initialize date array if it doesn't exist
      if (!history[dateKey]) {
        history[dateKey] = [];
      }
      
      // Add completed work order to the date's array
      history[dateKey].push({
        id: crypto.randomUUID(),
        wo_number: wo.number,
        completed_at: now.toISOString(),
        total_duration: wo.elapsedSeconds,
        images: wo.images,
        notes: woNotes || null,
      });
      
      // Save back to localStorage
      localStorage.setItem('workOrderHistory', JSON.stringify(history));
      
      // Dispatch event for CompletedWorkOrders to update
      window.dispatchEvent(new Event('historyUpdated'));
      
      toast.success(`WO ${wo.number} salva no histórico!`);
    } catch (error) {
      console.error("Error saving completed work order:", error);
      toast.error("Erro ao salvar no histórico");
    }
  };

  const removeWorkOrder = (id: string) => {
    const woToRemove = workOrders.find(wo => wo.id === id);
    if (woToRemove?.hasFinished) {
      stopAlarm();
      // Save to history before removing
      saveCompletedWorkOrder(woToRemove);
    }
    setWorkOrders(workOrders.filter(wo => wo.id !== id));
    toast.success("WO removida");
  };

  const showGuidanceForWO = (id: string) => {
    const now = Date.now();
    setWorkOrders(workOrders.map(wo => {
      if (wo.id !== id) return wo;
      // Accumulate elapsed time before stopping
      const sessionElapsed = wo.isRunning && wo.startTime ? Math.floor((now - wo.startTime) / 1000) : 0;
      return {
        ...wo,
        showGuidance: true,
        isRunning: false,
        elapsedSeconds: wo.elapsedSeconds + sessionElapsed,
        startTime: undefined,
      };
    }));
    stopAlarm();
  };

  const completeWorkOrder = (id: string) => {
    const woToComplete = workOrders.find(wo => wo.id === id);
    if (!woToComplete) return;

    stopAlarm();

    // Save with the exact elapsed time shown on the clock
    const elapsed = getElapsed(woToComplete);
    const woWithTime = { ...woToComplete, elapsedSeconds: elapsed };
    saveCompletedWorkOrder(woWithTime);

    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  };

  const toggleTimer = (id: string) => {
    const now = Date.now();
    setWorkOrders(
      workOrders.map((wo) => {
        if (wo.id !== id) return wo;
        
        if (wo.isRunning) {
          // Pausando: acumular tempo decorrido
          const sessionElapsed = wo.startTime ? Math.floor((now - wo.startTime) / 1000) : 0;
          return {
            ...wo,
            isRunning: false,
            elapsedSeconds: wo.elapsedSeconds + sessionElapsed,
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

  const silenceAlarm = (id: string) => {
    stopAlarm();
    setWorkOrders(
      workOrders.map((wo) => {
        if (wo.id !== id) return wo;
        return {
          ...wo,
          limitSeconds: wo.limitSeconds + 40 * 60,
          hasFinished: false,
          hasWarned: false,
        };
      })
    );
    toast.success("Alarme silenciado. Próximo alarme em 40 minutos.");
  };

  const resetTimer = (id: string) => {
    stopAlarm();
    setWorkOrders(
      workOrders.map((wo) => {
        if (wo.id !== id) return wo;
        return {
          ...wo,
          limitSeconds: wo.limitSeconds + 40 * 60,
          isRunning: false,
          hasFinished: false,
          hasWarned: false,
          showGuidance: false,
          startTime: undefined,
        };
      })
    );
    toast.success("Timer: +40 minutos adicionados!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getElapsed = (wo: WorkOrder): number => {
    if (!wo.isRunning || !wo.startTime) return wo.elapsedSeconds;
    const sessionElapsed = Math.floor((Date.now() - wo.startTime) / 1000);
    return wo.elapsedSeconds + sessionElapsed;
  };

  const getTimeRemaining = (wo: WorkOrder): number => {
    return Math.max(0, wo.limitSeconds - getElapsed(wo));
  };

  const getProgress = (wo: WorkOrder) => {
    const elapsed = getElapsed(wo);
    return Math.min(100, (elapsed / wo.limitSeconds) * 100);
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base md:text-lg">Timer de Ordens de Serviço</h3>
        </div>

        {/* Adicionar nova WO */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o número da WO"
              value={newWO}
              onChange={(e) => setNewWO(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWorkOrder()}
              className="flex-1"
            />
            <Button onClick={addWorkOrder} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Adicionar Imagens
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de WOs */}
        {workOrders.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-muted-foreground">
            <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhuma ordem de serviço adicionada</p>
            <p className="text-xs mt-1">Adicione WOs para iniciar a contagem</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workOrders.map((wo) => (
              <Card key={wo.id} className="p-3 md:p-4 bg-background/50">
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
                      className={`text-2xl md:text-3xl font-bold tabular-nums ${
                        wo.hasFinished
                          ? "text-destructive animate-pulse"
                          : getTimeRemaining(wo) <= 300
                          ? "text-orange-500"
                          : "text-primary"
                      }`}
                    >
                      {formatTime(getElapsed(wo))}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {wo.hasFinished
                        ? "⏰ Insira uma nota no Remedy!"
                        : getTimeRemaining(wo) <= 300
                        ? "⚠️ Últimos 5 minutos!"
                        : wo.isRunning
                        ? "Em andamento"
                        : "Pausado"}
                    </p>
                  </div>

                  <Progress value={getProgress(wo)} className="h-2" />


                  {wo.images && wo.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {wo.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`WO ${wo.number} - Imagem ${idx + 1}`}
                          className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => downloadImage(img, wo.number, idx)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {wo.hasFinished ? (
                      <>
                        <Button
                          onClick={() => silenceAlarm(wo.id)}
                          className="w-full h-9 text-xs md:text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse"
                        >
                          <AlertCircle className="w-4 h-4 mr-1 shrink-0" />
                          Silenciar
                        </Button>
                        <Button
                          onClick={() => completeWorkOrder(wo.id)}
                          className="w-full h-9 text-xs md:text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/40"
                        >
                          <CheckCircle className="w-4 h-4 mr-1 shrink-0" />
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        {!wo.isRunning ? (
                          <Button
                            onClick={() => toggleTimer(wo.id)}
                            className="flex-1 h-9 text-sm font-bold shadow-md bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/40"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        ) : (
                          <Button
                            onClick={() => completeWorkOrder(wo.id)}
                            className="flex-1 h-9 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/40"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {getTimeRemaining(wo) <= 300 && getTimeRemaining(wo) > 0 && !wo.hasFinished && (
                    <div className="flex items-center gap-2 p-2 md:p-3 bg-orange-500/10 border border-orange-500/20 rounded text-xs md:text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <p className="text-orange-700 dark:text-orange-300 font-medium">
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
