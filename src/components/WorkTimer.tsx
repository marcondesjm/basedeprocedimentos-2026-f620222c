import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Play, Pause, RotateCcw, AlertCircle, Plus, Trash2, CheckCircle, Image as ImageIcon, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

interface WorkOrder {
  id: string;
  number: string;
  totalSeconds: number;
  isRunning: boolean;
  hasFinished: boolean;
  hasWarned: boolean;
  startTime?: number;
  pausedTime?: number;
  images: string[];
}

export const WorkTimer = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [newWO, setNewWO] = useState("");
  const [alarmIntervalId, setAlarmIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
            startContinuousAlarm(wo.number);
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
    // Para qualquer alarme anterior
    if (alarmIntervalId) {
      clearInterval(alarmIntervalId);
    }

    // Toca o primeiro beep imediatamente
    playBeep();

    // Continua tocando a cada 2 segundos
    const intervalId = setInterval(() => {
      playBeep();
    }, 2000);

    setAlarmIntervalId(intervalId);
  };

  const stopAlarm = () => {
    if (alarmIntervalId) {
      clearInterval(alarmIntervalId);
      setAlarmIntervalId(null);
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
      totalSeconds: 40 * 60,
      isRunning: false,
      hasFinished: false,
      hasWarned: false,
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
        total_duration: wo.totalSeconds,
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

  const completeWorkOrder = (id: string) => {
    const woToComplete = workOrders.find(wo => wo.id === id);
    if (!woToComplete) return;

    // Stop alarm if running
    stopAlarm();

    // Save to history
    saveCompletedWorkOrder(woToComplete);

    // Remove from active list
    setWorkOrders(workOrders.filter(wo => wo.id !== id));
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
    stopAlarm();
    const woToReset = workOrders.find(wo => wo.id === id);
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
              images: woToReset?.images || [],
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
                          : getTimeLeft(wo) <= 300
                          ? "text-orange-500"
                          : "text-primary"
                      }`}
                    >
                      {formatTime(getTimeLeft(wo))}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {wo.hasFinished
                        ? "⏰ Tempo esgotado! Adicione uma nota."
                        : getTimeLeft(wo) <= 300
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
                        {/* Orientações - apenas lembrete visual, não salva */}
                        <Collapsible className="w-full">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              <span className="font-medium">Orientações para a Nota</span>
                            </div>
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-md text-xs text-muted-foreground space-y-2">
                            <p>• Detalhe todos os procedimentos e testes realizados</p>
                            <p>• Informe os documentos do BC Suporte utilizados como referência</p>
                            <p>• Anexe quaisquer print/foto em nota normal, <strong>ANTES</strong> de salvar a conclusão, pois na nota de conclusão só é possível utilizar texto</p>
                            <p>• Em "Motivo do Status", use apenas <strong>"Utilização de procedimentos"</strong></p>
                            <p>• Em caso de dúvidas acione a Supervisão ou Ticket Manager</p>
                            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-300 text-center">
                              <p className="font-semibold">⚠️ Atenção ⚠️</p>
                              <p>Notificar usuário com a solução realizada: <strong>SIM</strong></p>
                              <p>Modo de execução: <strong>Remoto</strong></p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Button
                          onClick={() => stopAlarm()}
                          size="sm"
                          variant="destructive"
                          className="w-full"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Silenciar Alarme
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => completeWorkOrder(wo.id)}
                            size="sm"
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Salvar no Histórico
                          </Button>
                          <Button
                            onClick={() => resetTimer(wo.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reiniciar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => toggleTimer(wo.id)}
                          size="sm"
                          variant={wo.isRunning ? "outline" : "default"}
                          className={`flex-1 ${!wo.isRunning ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
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
                          onClick={() => completeWorkOrder(wo.id)}
                          size="sm"
                          variant="default"
                          className="flex-1 bg-black hover:bg-gray-900 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluir
                        </Button>
                        <Button
                          onClick={() => resetTimer(wo.id)}
                          size="sm"
                          variant="outline"
                          className="w-auto px-3"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {getTimeLeft(wo) <= 300 && getTimeLeft(wo) > 0 && !wo.hasFinished && (
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
