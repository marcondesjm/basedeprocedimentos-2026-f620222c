import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, Image as ImageIcon, Trash2, ChevronDown, ChevronUp, Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompletedWO {
  id: string;
  wo_number: string;
  completed_at: string;
  total_duration: number;
  images: string[];
  notes: string | null;
}

interface HistoryByDate {
  [date: string]: CompletedWO[];
}

export const CompletedWorkOrders = () => {
  const [historyByDate, setHistoryByDate] = useState<HistoryByDate>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdate = () => {
      loadHistory();
    };

    window.addEventListener('historyUpdated', handleHistoryUpdate);
    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, []);

  const loadHistory = () => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      setHistoryByDate(history);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = (dateKey: string, orderId: string) => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      
      if (history[dateKey]) {
        history[dateKey] = history[dateKey].filter((wo: CompletedWO) => wo.id !== orderId);
        
        if (history[dateKey].length === 0) {
          delete history[dateKey];
        }
        
        localStorage.setItem('workOrderHistory', JSON.stringify(history));
        setHistoryByDate(history);
        toast.success("Chamado removido do histórico");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao remover chamado");
    }
  };

  const exportBackup = () => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      
      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_historico_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Backup exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting backup:", error);
      toast.error("Erro ao exportar backup");
    }
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        
        const existingData = localStorage.getItem('workOrderHistory');
        const existing = existingData ? JSON.parse(existingData) : {};
        
        const merged = { ...existing };
        Object.keys(importedData).forEach(dateKey => {
          if (merged[dateKey]) {
            merged[dateKey] = [...merged[dateKey], ...importedData[dateKey]];
          } else {
            merged[dateKey] = importedData[dateKey];
          }
        });
        
        localStorage.setItem('workOrderHistory', JSON.stringify(merged));
        setHistoryByDate(merged);
        toast.success("Backup importado com sucesso!");
      } catch (error) {
        console.error("Error importing backup:", error);
        toast.error("Erro ao importar backup");
      }
    };
    reader.readAsText(file);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutos`;
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

  if (loading) {
    return (
      <Card className="p-4 md:p-6">
        <div className="text-center text-muted-foreground">Carregando histórico...</div>
      </Card>
    );
  }

  const allDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Histórico de Chamados</h2>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={exportBackup}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Backup
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  input?.click();
                }}
              >
                <Upload className="w-4 h-4" />
                Importar Backup
              </Button>
            </label>
          </div>
        </div>

        {allDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Nenhum chamado concluído ainda</p>
          </div>
        ) : (
          <div className="space-y-6">
            {allDates.map((dateKey) => {
              const orders = historyByDate[dateKey];
              const dateObj = new Date(dateKey + 'T12:00:00');
              
              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h3>
                    <Badge variant="secondary" className="ml-auto">
                      {orders.length} {orders.length === 1 ? 'chamado' : 'chamados'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 pl-4">
                    {orders.map((wo) => {
                      const isExpanded = expandedOrders.has(wo.id);
                      const completedDate = new Date(wo.completed_at);
                      
                      return (
                        <Card key={wo.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono">
                                  WO {wo.wo_number}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {format(completedDate, "HH:mm", { locale: ptBR })}
                                </div>
                                <Badge variant="secondary">
                                  {formatDuration(wo.total_duration)}
                                </Badge>
                                {wo.images && wo.images.length > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {wo.images.length}
                                  </Badge>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="pt-2 space-y-3 border-t">
                                  {wo.notes && (
                                    <div>
                                      <p className="text-sm font-medium mb-1">Observações:</p>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {wo.notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {wo.images && wo.images.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Imagens:</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {wo.images.map((img, idx) => (
                                          <div
                                            key={idx}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary cursor-pointer transition-colors"
                                            onClick={() => downloadImage(img, wo.wo_number, idx)}
                                          >
                                            <img
                                              src={img}
                                              alt={`WO ${wo.wo_number} - Imagem ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center">
                                              <Download className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {((wo.notes && wo.notes.length > 0) || (wo.images && wo.images.length > 0)) && (
                                <Button
                                  onClick={() => toggleExpand(wo.id)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                onClick={() => deleteOrder(dateKey, wo.id)}
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
