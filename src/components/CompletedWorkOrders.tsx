import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Clock, Image as ImageIcon, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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

export const CompletedWorkOrders = () => {
  const [completedOrders, setCompletedOrders] = useState<CompletedWO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("completed_work_orders")
        .select("*")
        .order("completed_at", { ascending: false });

      if (error) throw error;
      setCompletedOrders(data || []);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("completed_work_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setCompletedOrders(completedOrders.filter(wo => wo.id !== id));
      toast.success("Chamado removido do histórico");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao remover chamado");
    }
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

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base md:text-lg">
            Histórico de Chamados Atendidos
          </h3>
          <Badge variant="secondary" className="ml-auto">
            {completedOrders.length}
          </Badge>
        </div>

        {completedOrders.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum chamado atendido ainda</p>
            <p className="text-xs mt-1">Complete WOs para visualizar o histórico</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedOrders.map((wo) => {
              const isExpanded = expandedOrders.has(wo.id);
              return (
                <Card key={wo.id} className="p-3 md:p-4 bg-background/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="default">WO {wo.wo_number}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(wo.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(wo.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrder(wo.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(wo.total_duration)}
                      </span>
                      {wo.images && wo.images.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {wo.images.length} {wo.images.length === 1 ? 'imagem' : 'imagens'}
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <>
                        {wo.notes && (
                          <div className="p-2 bg-muted/50 rounded text-xs">
                            <p className="font-medium mb-1">Observações:</p>
                            <p className="text-muted-foreground">{wo.notes}</p>
                          </div>
                        )}

                        {wo.images && wo.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {wo.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`WO ${wo.wo_number} - Imagem ${idx + 1}`}
                                className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => downloadImage(img, wo.wo_number, idx)}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
