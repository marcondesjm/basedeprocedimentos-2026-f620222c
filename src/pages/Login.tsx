import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, RefreshCw, Trash2, LogIn } from "lucide-react";

const APP_VERSION = '2.6.0';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpToDate, setIsUpToDate] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'current_version')
          .single();
        if (data && data.value !== APP_VERSION) {
          setIsUpToDate(false);
          toast.info('🔄 Nova versão disponível!');
        } else {
          setIsUpToDate(true);
        }
      } catch { setIsUpToDate(true); }
    };
    checkVersion();

    const channel = supabase
      .channel('login-version-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config', filter: 'key=eq.current_version' },
        (payload) => {
          if (payload.new?.value !== APP_VERSION) {
            toast.info('🔄 Atualização disponível! Recarregando...');
            handleClearCache();
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleClearCache = async () => {
    setIsSyncing(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      localStorage.removeItem('app_version');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      toast.success('Cache limpo! Recarregando...', { duration: 2000 });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error('Erro ao limpar cache');
      setIsSyncing(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'current_version')
        .single();
      if (data && data.value !== APP_VERSION) {
        toast.info('Nova versão detectada! Limpando cache...');
        await handleClearCache();
      } else {
        setIsUpToDate(true);
        toast.success('✅ App já está atualizado!');
        setIsSyncing(false);
      }
    } catch {
      toast.error('Erro ao verificar versão');
      setIsSyncing(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch {
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Erro ao fazer login com Google");
      }
    } catch {
      toast.error("Erro ao conectar com Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4 gap-4">
      {/* Version & Sync Bar */}
      <div className="w-full max-w-md flex items-center justify-between rounded-lg bg-white/10 backdrop-blur px-4 py-2 text-white text-xs">
        <span className="font-mono">v{APP_VERSION}</span>
        <div className="flex items-center gap-2">
          {isUpToDate === true && (
            <span className="text-green-300 flex items-center gap-1">✓ Atualizado</span>
          )}
          {isUpToDate === false && (
            <span className="text-yellow-300 flex items-center gap-1">⚠ Desatualizado</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="h-7 px-2 text-white hover:bg-white/20 text-xs gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCache}
            disabled={isSyncing}
            className="h-7 px-2 text-white hover:bg-white/20 text-xs gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Limpar Cache
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Gestão de Procedimentos</CardTitle>
          <CardDescription className="text-base">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {/* Email/Password Login */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2">
              <LogIn className="w-4 h-4" />
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-11 text-sm gap-3"
            variant="outline"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? "Conectando..." : "Entrar com Google"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Desenvolvido por Marcondes Jorge Machado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
