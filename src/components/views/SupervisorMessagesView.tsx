import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SupervisorMessage {
  id: string;
  message: string;
  details: string | null;
  active: boolean;
  created_at: string;
}

const SUPERVISOR_EMAIL = "supervisores.hepta@gmail.com";

export const SupervisorMessagesView = () => {
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{ open: boolean; message: SupervisorMessage | null }>({ open: false, message: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [form, setForm] = useState({ message: "", details: "", active: true });
  const [isSupervisor, setIsSupervisor] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSupervisor(session?.user?.email === SUPERVISOR_EMAIL);
    });
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("supervisor_messages" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as any as SupervisorMessage[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const openCreate = () => {
    setForm({ message: "", details: "", active: true });
    setEditDialog({ open: true, message: null });
  };

  const openEdit = (msg: SupervisorMessage) => {
    setForm({ message: msg.message, details: msg.details || "", active: msg.active });
    setEditDialog({ open: true, message: msg });
  };

  const handleSave = async () => {
    if (!form.message.trim()) {
      toast.error("A mensagem não pode estar vazia");
      return;
    }

    if (editDialog.message) {
      // Update
      const { error } = await supabase
        .from("supervisor_messages" as any)
        .update({ message: form.message, details: form.details || null, active: form.active } as any)
        .eq("id", editDialog.message.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Mensagem atualizada!");
    } else {
      // Create
      const { error } = await supabase
        .from("supervisor_messages" as any)
        .insert({ message: form.message, details: form.details || null, active: form.active } as any);
      if (error) { toast.error("Erro ao criar"); return; }
      toast.success("Mensagem criada!");
    }

    setEditDialog({ open: false, message: null });
    fetchMessages();
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    const { error } = await supabase
      .from("supervisor_messages" as any)
      .delete()
      .eq("id", deleteDialog.id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Mensagem excluída!");
    setDeleteDialog({ open: false, id: null });
    fetchMessages();
  };

  const toggleActive = async (msg: SupervisorMessage) => {
    const { error } = await supabase
      .from("supervisor_messages" as any)
      .update({ active: !msg.active } as any)
      .eq("id", msg.id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    fetchMessages();
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
          {messages.map((msg) => (
            <Card key={msg.id} className={`p-4 transition-opacity ${!msg.active ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={msg.active ? "default" : "secondary"}>
                      {msg.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">📢 {msg.message}</p>
                  {msg.details && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleActive(msg)}
                    title={msg.active ? "Desativar" : "Ativar"}
                  >
                    {msg.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(msg)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialog({ open: true, id: msg.id })}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, message: null })}>
        <DialogContent className="sm:max-w-lg">
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
                rows={6}
                className="mt-1"
              />
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
