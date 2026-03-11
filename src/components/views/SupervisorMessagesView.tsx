import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SupervisorMessage {
  id: string;
  message: string;
  details: string | null;
  active: boolean;
  created_at: string;
  scheduled_at: string | null;
  expires_at: string | null;
}

const SUPERVISOR_EMAIL = "supervisores.hepta@gmail.com";

export const SupervisorMessagesView = () => {
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{ open: boolean; message: SupervisorMessage | null }>({ open: false, message: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [form, setForm] = useState({
    message: "",
    details: "",
    active: true,
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "",
    expiresDate: undefined as Date | undefined,
    expiresTime: "",
  });
  const [isSupervisor, setIsSupervisor] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSupervisor(session?.user?.email === SUPERVISOR_EMAIL);
    });
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("supervisor_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as any as SupervisorMessage[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const parseDatetime = (dateStr: string | null): { date: Date | undefined; time: string } => {
    if (!dateStr) return { date: undefined, time: "" };
    const d = new Date(dateStr);
    return {
      date: d,
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    };
  };

  const combineDatetime = (date: Date | undefined, time: string): string | null => {
    if (!date) return null;
    const [h, m] = (time || "00:00").split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(h || 0, m || 0, 0, 0);
    return combined.toISOString();
  };

  const openCreate = () => {
    setForm({ message: "", details: "", active: true, scheduledDate: undefined, scheduledTime: "", expiresDate: undefined, expiresTime: "" });
    setEditDialog({ open: true, message: null });
  };

  const openEdit = (msg: SupervisorMessage) => {
    const scheduled = parseDatetime(msg.scheduled_at);
    const expires = parseDatetime(msg.expires_at);
    setForm({
      message: msg.message,
      details: msg.details || "",
      active: msg.active,
      scheduledDate: scheduled.date,
      scheduledTime: scheduled.time,
      expiresDate: expires.date,
      expiresTime: expires.time,
    });
    setEditDialog({ open: true, message: msg });
  };

  const handleSave = async () => {
    if (!form.message.trim()) {
      toast.error("A mensagem não pode estar vazia");
      return;
    }

    const payload = {
      message: form.message,
      details: form.details || null,
      active: form.active,
      scheduled_at: combineDatetime(form.scheduledDate, form.scheduledTime),
      expires_at: combineDatetime(form.expiresDate, form.expiresTime),
    };

    if (editDialog.message) {
      const { error } = await supabase
        .from("supervisor_messages")
        .update(payload)
        .eq("id", editDialog.message.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Mensagem atualizada!");
    } else {
      const { error } = await supabase
        .from("supervisor_messages")
        .insert(payload);
      if (error) { toast.error("Erro ao criar"); return; }
      toast.success("Mensagem criada!");
    }

    setEditDialog({ open: false, message: null });
    fetchMessages();
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    const { error } = await supabase
      .from("supervisor_messages")
      .delete()
      .eq("id", deleteDialog.id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Mensagem excluída!");
    setDeleteDialog({ open: false, id: null });
    fetchMessages();
  };

  const toggleActive = async (msg: SupervisorMessage) => {
    const { error } = await supabase
      .from("supervisor_messages")
      .update({ active: !msg.active })
      .eq("id", msg.id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    fetchMessages();
  };

  const getScheduleStatus = (msg: SupervisorMessage) => {
    const now = new Date();
    if (msg.scheduled_at && new Date(msg.scheduled_at) > now) return "scheduled";
    if (msg.expires_at && new Date(msg.expires_at) <= now) return "expired";
    return "live";
  };

  if (!isSupervisor) {
    return (
      <section className="space-y-6" aria-label="Acesso restrito">
        <Card className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas supervisores autorizados podem gerenciar mensagens.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-label="Gerenciar mensagens dos supervisores">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Mensagens dos Supervisores</h2>
            <p className="text-sm text-muted-foreground">Gerencie os avisos exibidos no painel</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Mensagem
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma mensagem cadastrada.</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Criar primeira mensagem
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const status = getScheduleStatus(msg);
            return (
              <Card key={msg.id} className={cn("p-4 transition-opacity", !msg.active && "opacity-50")}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={msg.active ? "default" : "secondary"}>
                        {msg.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {status === "scheduled" && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1">
                          <Clock className="w-3 h-3" />
                          Agendado
                        </Badge>
                      )}
                      {status === "expired" && (
                        <Badge variant="outline" className="text-muted-foreground border-muted gap-1">
                          Expirado
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), "dd/MM/yyyy 'às' HH:mm")}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">📢 {msg.message}</p>
                    {msg.details && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.details}</p>
                    )}
                    {(msg.scheduled_at || msg.expires_at) && (
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {msg.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Início: {format(new Date(msg.scheduled_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        )}
                        {msg.expires_at && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Fim: {format(new Date(msg.expires_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(msg)} title={msg.active ? "Desativar" : "Ativar"}>
                      {msg.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(msg)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, id: msg.id })} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, message: null })}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDialog.message ? "Editar Mensagem" : "Nova Mensagem"}</DialogTitle>
            <DialogDescription>
              {editDialog.message ? "Atualize os dados da mensagem." : "Crie um novo aviso para exibir no painel."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="msg-title">Mensagem (título curto)</Label>
              <Input
                id="msg-title"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Ex: Feriado - 06/03 - PE"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="msg-details">Detalhes (exibido no popup "Saiba mais")</Label>
              <Textarea
                id="msg-details"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Texto completo do comunicado..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Scheduling */}
            <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Agendamento (opcional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scheduled At */}
                <div className="space-y-2">
                  <Label className="text-xs">Exibir a partir de</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.scheduledDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.scheduledDate ? format(form.scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.scheduledDate}
                        onSelect={(d) => setForm({ ...form, scheduledDate: d })}
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    placeholder="00:00"
                  />
                  {form.scheduledDate && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setForm({ ...form, scheduledDate: undefined, scheduledTime: "" })}>
                      Limpar
                    </Button>
                  )}
                </div>

                {/* Expires At */}
                <div className="space-y-2">
                  <Label className="text-xs">Exibir até</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.expiresDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.expiresDate ? format(form.expiresDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.expiresDate}
                        onSelect={(d) => setForm({ ...form, expiresDate: d })}
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={form.expiresTime}
                    onChange={(e) => setForm({ ...form, expiresTime: e.target.value })}
                    placeholder="00:00"
                  />
                  {form.expiresDate && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setForm({ ...form, expiresDate: undefined, expiresTime: "" })}>
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deixe em branco para exibir imediatamente e sem data de expiração.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="msg-active"
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
              <Label htmlFor="msg-active">Mensagem ativa (visível no painel)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, message: null })}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editDialog.message ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir mensagem?</DialogTitle>
            <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
