import { useState, useEffect, useRef } from "react";
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

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    const NUM_STARS = 300;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 2 + 0.5,
      });
    }

    const addShootingStar = () => {
      if (Math.random() < 0.008) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.3) * 8,
          vy: Math.random() * 4 + 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((star) => {
        const twinkle = 0.5 + Math.sin(Date.now() * 0.002 * star.z + star.x) * 0.5;
        const alpha = twinkle * (star.z / 3.5);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (star.z / 3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();

        // Glow
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150, 180, 255, ${alpha * 0.15})`;
          ctx.fill();
        }

        star.y += star.z * 0.08;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      addShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (s.life >= s.maxLife) shootingStars.splice(i, 1);
      }

      // Nebula glow
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.4, 0,
        canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.5
      );
      gradient.addColorStop(0, "rgba(30, 58, 138, 0.03)");
      gradient.addColorStop(0.5, "rgba(88, 28, 135, 0.02)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    // Initial fill
    ctx.fillStyle = "rgb(3, 7, 18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: "rgb(3, 7, 18)" }}
    />
  );
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpToDate, setIsUpToDate] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          .select('value, updated_at')
          .eq('key', 'current_version')
          .single();
        if (data) {
          setLastUpdated(data.updated_at);
          if (data.value !== APP_VERSION) {
            setIsUpToDate(false);
            toast.info('🔄 Nova versão disponível!');
          } else {
            setIsUpToDate(true);
          }
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      if (error) toast.error("Erro ao fazer login com Google");
    } catch {
      toast.error("Erro ao conectar com Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <SpaceBackground />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center px-3 sm:px-4 py-4 gap-3 sm:gap-4 max-w-md mx-auto">
        {/* Version & Sync Bar */}
        <div className="w-full flex flex-wrap items-center justify-between rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 sm:px-4 py-2 text-white text-xs gap-2">
          <span className="font-mono text-[10px] sm:text-xs opacity-70">v{APP_VERSION}</span>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {isUpToDate === true && (
              <span className="text-emerald-400 flex items-center gap-1 text-[10px] sm:text-xs">✓ Atualizado</span>
            )}
            {isUpToDate === false && (
              <span className="text-amber-400 flex items-center gap-1 text-[10px] sm:text-xs">⚠ Desatualizado</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="h-6 sm:h-7 px-1.5 sm:px-2 text-white hover:bg-white/10 text-[10px] sm:text-xs gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Verificar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              disabled={isSyncing}
              className="h-6 sm:h-7 px-1.5 sm:px-2 text-white hover:bg-white/10 text-[10px] sm:text-xs gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden xs:inline">Cache</span>
            </Button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full border-0 shadow-2xl bg-card/80 backdrop-blur-xl animate-fade-in">
          <CardHeader className="text-center space-y-3 pb-2 px-4 sm:px-6 pt-5 sm:pt-6">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Gestão de Procedimentos</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 pt-3 sm:pt-4 px-4 sm:px-6 pb-5 sm:pb-6">
            {/* Email/Password */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs sm:text-sm">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-10 sm:h-11 gap-2 text-sm">
                <LogIn className="w-4 h-4" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Google */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-10 sm:h-11 text-sm gap-3"
              variant="outline"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? "Conectando..." : "Entrar com Google"}
            </Button>

            <p className="text-center text-[10px] sm:text-xs text-muted-foreground pt-1">
              Desenvolvido por Marcondes Jorge Machado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
