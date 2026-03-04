import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, Image as ImageIcon, Trash2, ChevronDown, ChevronUp, Download, Upload, Archive, Search, RotateCcw } from "lucide-react";
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
  const [archivedByDate, setArchivedByDate] = useState<HistoryByDate>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showArchive, setShowArchive] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [archiveSearch, setArchiveSearch] = useState("");

  const toggleDay = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  useEffect(() => {
    loadHistory();
    loadArchive();

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

  const loadArchive = () => {
    try {
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};
      setArchivedByDate(archive);
    } catch (error) {
      console.error("Error loading archive:", error);
    }
  };

  const archiveOrder = (dateKey: string, orderId: string) => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};

      const order = history[dateKey]?.find((wo: CompletedWO) => wo.id === orderId);
      if (!order) return;

      // Add to archive
      if (!archive[dateKey]) archive[dateKey] = [];
      archive[dateKey].push(order);

      // Remove from history
      history[dateKey] = history[dateKey].filter((wo: CompletedWO) => wo.id !== orderId);
      if (history[dateKey].length === 0) delete history[dateKey];

      localStorage.setItem('workOrderHistory', JSON.stringify(history));
      localStorage.setItem('workOrderArchive', JSON.stringify(archive));
      setHistoryByDate(history);
      setArchivedByDate(archive);
      toast.success("Chamado arquivado!");
    } catch (error) {
      console.error("Error archiving order:", error);
      toast.error("Erro ao arquivar chamado");
    }
  };

  const archiveDay = (dateKey: string) => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};

      const orders = history[dateKey];
      if (!orders || orders.length === 0) return;

      if (!archive[dateKey]) archive[dateKey] = [];
      archive[dateKey].push(...orders);

      delete history[dateKey];

      localStorage.setItem('workOrderHistory', JSON.stringify(history));
      localStorage.setItem('workOrderArchive', JSON.stringify(archive));
      setHistoryByDate(history);
      setArchivedByDate(archive);
      toast.success(`Dia arquivado com ${orders.length} chamado(s)!`);
    } catch (error) {
      console.error("Error archiving day:", error);
      toast.error("Erro ao arquivar dia");
    }
  };

  const restoreDay = (dateKey: string) => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};

      const orders = archive[dateKey];
      if (!orders || orders.length === 0) return;

      if (!history[dateKey]) history[dateKey] = [];
      history[dateKey].push(...orders);

      delete archive[dateKey];

      localStorage.setItem('workOrderHistory', JSON.stringify(history));
      localStorage.setItem('workOrderArchive', JSON.stringify(archive));
      setHistoryByDate(history);
      setArchivedByDate(archive);
      toast.success(`Dia restaurado com ${orders.length} chamado(s)!`);
    } catch (error) {
      console.error("Error restoring day:", error);
      toast.error("Erro ao restaurar dia");
    }
  };

  const restoreOrder = (dateKey: string, orderId: string) => {
    try {
      const historyData = localStorage.getItem('workOrderHistory');
      const history = historyData ? JSON.parse(historyData) : {};
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};

      const order = archive[dateKey]?.find((wo: CompletedWO) => wo.id === orderId);
      if (!order) return;

      // Add back to history
      if (!history[dateKey]) history[dateKey] = [];
      history[dateKey].push(order);

      // Remove from archive
      archive[dateKey] = archive[dateKey].filter((wo: CompletedWO) => wo.id !== orderId);
      if (archive[dateKey].length === 0) delete archive[dateKey];

      localStorage.setItem('workOrderHistory', JSON.stringify(history));
      localStorage.setItem('workOrderArchive', JSON.stringify(archive));
      setHistoryByDate(history);
      setArchivedByDate(archive);
      toast.success("Chamado restaurado ao histórico!");
    } catch (error) {
      console.error("Error restoring order:", error);
      toast.error("Erro ao restaurar chamado");
    }
  };

  const deleteOrder = (dateKey: string, orderId: string, fromArchive = false) => {
    try {
      const storageKey = fromArchive ? 'workOrderArchive' : 'workOrderHistory';
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : {};

      if (parsed[dateKey]) {
        parsed[dateKey] = parsed[dateKey].filter((wo: CompletedWO) => wo.id !== orderId);
        if (parsed[dateKey].length === 0) delete parsed[dateKey];
        localStorage.setItem(storageKey, JSON.stringify(parsed));

        if (fromArchive) {
          setArchivedByDate(parsed);
        } else {
          setHistoryByDate(parsed);
        }
        toast.success("Chamado removido");
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
      const archiveData = localStorage.getItem('workOrderArchive');
      const archive = archiveData ? JSON.parse(archiveData) : {};
      
      const dataStr = JSON.stringify({ history, archive }, null, 2);
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
        
        // Support both old format (flat history) and new format ({ history, archive })
        const importedHistory = importedData.history || importedData;
        const importedArchive = importedData.archive || {};

        const existingHistory = localStorage.getItem('workOrderHistory');
        const existingH = existingHistory ? JSON.parse(existingHistory) : {};
        const existingArchive = localStorage.getItem('workOrderArchive');
        const existingA = existingArchive ? JSON.parse(existingArchive) : {};
        
        const mergedHistory = { ...existingH };
        Object.keys(importedHistory).forEach(dateKey => {
          if (mergedHistory[dateKey]) {
            mergedHistory[dateKey] = [...mergedHistory[dateKey], ...importedHistory[dateKey]];
          } else {
            mergedHistory[dateKey] = importedHistory[dateKey];
          }
        });

        const mergedArchive = { ...existingA };
        Object.keys(importedArchive).forEach(dateKey => {
          if (mergedArchive[dateKey]) {
            mergedArchive[dateKey] = [...mergedArchive[dateKey], ...importedArchive[dateKey]];
          } else {
            mergedArchive[dateKey] = importedArchive[dateKey];
          }
        });
        
        localStorage.setItem('workOrderHistory', JSON.stringify(mergedHistory));
        localStorage.setItem('workOrderArchive', JSON.stringify(mergedArchive));
        setHistoryByDate(mergedHistory);
        setArchivedByDate(mergedArchive);
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
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  const getFilteredArchive = () => {
    if (!archiveSearch.trim()) return archivedByDate;
    const search = archiveSearch.toLowerCase();
    const filtered: HistoryByDate = {};
    Object.entries(archivedByDate).forEach(([dateKey, orders]) => {
      const matched = orders.filter(wo =>
        wo.wo_number.toLowerCase().includes(search) ||
        wo.notes?.toLowerCase().includes(search)
      );
      if (matched.length > 0) filtered[dateKey] = matched;
    });
    return filtered;
  };

  const archiveCount = Object.values(archivedByDate).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <Card className="p-4 md:p-6">
        <div className="text-center text-muted-foreground">Carregando histórico...</div>
      </Card>
    );
  }

  const renderOrderList = (dates: string[], data: HistoryByDate, isArchive: boolean) => {
    // Group dates by month
    const monthGroups: { [monthKey: string]: string[] } = {};
    dates.forEach((dateKey) => {
      const monthKey = dateKey.substring(0, 7); // yyyy-MM
      if (!monthGroups[monthKey]) monthGroups[monthKey] = [];
      monthGroups[monthKey].push(dateKey);
    });

    const sortedMonths = Object.keys(monthGroups).sort((a, b) => b.localeCompare(a));

    return (
      <div className="space-y-8">
        {sortedMonths.map((monthKey) => {
          const monthDates = monthGroups[monthKey];
          const monthDate = new Date(monthKey + '-15');
          const totalMonthOrders = monthDates.reduce((sum, dk) => sum + (data[dk]?.length || 0), 0);

          return (
            <div key={monthKey} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/30">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg capitalize">
                  {format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </h3>
                <Badge variant="default" className="ml-auto">
                  {totalMonthOrders} {totalMonthOrders === 1 ? 'chamado' : 'chamados'}
                </Badge>
              </div>

              <div className="space-y-5 pl-2">
                {monthDates.map((dateKey) => {
                  const orders = data[dateKey];
                  const dateObj = new Date(dateKey + 'T12:00:00');

                  return (
                    <div key={dateKey} className="space-y-3">
                      <div
                        className="flex items-center gap-2 pb-1 border-b border-border/50 cursor-pointer select-none"
                        onClick={() => toggleDay(dateKey)}
                      >
                        {expandedDays.has(dateKey) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-semibold text-base">
                          {format(dateObj, "dd 'de' MMMM", { locale: ptBR })}
                        </h4>
                        <div className="flex items-center gap-2 ml-auto">
                          {isArchive ? (
                            <Button
                              onClick={(e) => { e.stopPropagation(); restoreDay(dateKey); }}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1"
                              title="Restaurar dia inteiro"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restaurar dia
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => { e.stopPropagation(); archiveDay(dateKey); }}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1"
                              title="Arquivar dia inteiro"
                            >
                              <Archive className="w-3 h-3" />
                              Arquivar dia
                            </Button>
                          )}
                          <Badge variant="secondary">
                            {orders.length} {orders.length === 1 ? 'chamado' : 'chamados'}
                          </Badge>
                        </div>
                      </div>

                      {expandedDays.has(dateKey) && (
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
                                      WO00000{wo.wo_number}
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

                                <div className="flex gap-1">
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
                                  {isArchive ? (
                                    <Button
                                      onClick={() => restoreOrder(dateKey, wo.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-primary hover:text-primary hover:bg-primary/10"
                                      title="Restaurar ao histórico"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => archiveOrder(dateKey, wo.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                      title="Arquivar"
                                    >
                                      <Archive className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => deleteOrder(dateKey, wo.id, isArchive)}
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
            </div>
          );
        })}
      </div>
    );
  };

  const allDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));
  const filteredArchive = getFilteredArchive();
  const archiveDates = Object.keys(filteredArchive).sort((a, b) => b.localeCompare(a));

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Histórico de Chamados</h2>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowArchive(!showArchive)}
              size="sm"
              variant={showArchive ? "default" : "outline"}
              className="gap-2"
            >
              <Archive className="w-4 h-4" />
              Arquivo {archiveCount > 0 && `(${archiveCount})`}
            </Button>
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

        {showArchive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar no arquivo (WO ou observações)..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {archiveDates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>{archiveSearch ? "Nenhum resultado encontrado" : "Nenhum chamado arquivado"}</p>
              </div>
            ) : (
              renderOrderList(archiveDates, filteredArchive, true)
            )}
          </div>
        ) : (
          <>
            {allDates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nenhum chamado concluído ainda</p>
              </div>
            ) : (
              renderOrderList(allDates, historyByDate, false)
            )}
          </>
        )}
      </div>
    </Card>
  );
};
