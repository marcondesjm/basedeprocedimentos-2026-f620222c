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

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    const MOUSE_RADIUS = 120;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    const onTouchMove = (e: TouchEvent) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    const fontSize = 13;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -80);
    let speeds: number[] = new Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);

    // Grid nodes for circuit pattern
    const nodes: { x: number; y: number; pulse: number; connections: number[] }[] = [];
    const NUM_NODES = 40;
    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        pulse: Math.random() * Math.PI * 2,
        connections: [],
      });
    }
    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          nodes[i].connections.push(j);
        }
      }
    }

    // Hex data blocks
    const hexBlocks: { x: number; y: number; text: string; alpha: number; life: number }[] = [];

    const addHexBlock = () => {
      if (Math.random() < 0.02 && hexBlocks.length < 8) {
        const hexChars = "0123456789ABCDEF";
        let text = "0x";
        for (let i = 0; i < 8; i++) text += hexChars[Math.floor(Math.random() * 16)];
        hexBlocks.push({
          x: Math.random() * (canvas.width - 100),
          y: Math.random() * canvas.height,
          text,
          alpha: 0,
          life: 0,
        });
      }
    };

    // Code snippets floating in background
    const codeSnippets = [
      "const init = () => {",
      "  await fetch('/api/data');",
      "if (status === 200) {",
      "  return response.json();",
      "export default App;",
      "import React from 'react';",
      "const [state, setState] =",
      "  useState<boolean>(false);",
      "async function loadData() {",
      "  const result = await db",
      "    .query('SELECT * FROM');",
      "try { connect(); }",
      "catch (err) { log(err); }",
      "socket.on('message', cb);",
      "router.get('/health', ok);",
      "npm install --save-dev",
      "docker compose up -d",
      "git push origin main",
      "CREATE TABLE users (",
      "  id SERIAL PRIMARY KEY",
      ");",
      "console.log('deployed');",
      "useEffect(() => {}, []);",
      "interface Props { id: string }",
      "type Response = { ok: bool }",
      "kubectl apply -f deploy.yml",
      "ssh root@192.168.1.100",
      "sudo systemctl restart",
      "ping -c 4 10.0.0.1",
      "chmod 755 ./script.sh",
    ];
    const codeLines: { x: number; y: number; text: string; alpha: number; speed: number; fontSize: number }[] = [];

    const addCodeLine = () => {
      if (Math.random() < 0.025 && codeLines.length < 15) {
        const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        codeLines.push({
          x: Math.random() * (canvas.width - 200),
          y: -20,
          text: snippet,
          alpha: 0.12 + Math.random() * 0.15,
          speed: 0.15 + Math.random() * 0.35,
          fontSize: 10 + Math.floor(Math.random() * 3),
        });
      }
    };

    // Scanning line
    let scanY = 0;

    const resizeHandler = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -80);
      speeds = new Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);
    };
    window.addEventListener("resize", resizeHandler);

    const animate = () => {
      time++;

      // Dark fade with slight blue tint
      ctx.fillStyle = "rgba(0, 2, 8, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Circuit grid lines
      ctx.lineWidth = 0.5;
      for (const node of nodes) {
        node.pulse += 0.02;
        const nodeAlpha = 0.15 + Math.sin(node.pulse) * 0.1;

        // Draw connections
        for (const j of node.connections) {
          const other = nodes[j];
          const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
          gradient.addColorStop(0, `rgba(0, 180, 80, ${nodeAlpha * 0.3})`);
          gradient.addColorStop(0.5, `rgba(0, 255, 120, ${nodeAlpha * 0.15})`);
          gradient.addColorStop(1, `rgba(0, 180, 80, ${nodeAlpha * 0.3})`);
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();

          // Traveling pulse along line
          const pulsePos = (Math.sin(time * 0.03 + node.pulse) + 1) / 2;
          const px = node.x + (other.x - node.x) * pulsePos;
          const py = node.y + (other.y - node.y) * pulsePos;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 120, ${nodeAlpha * 1.5})`;
          ctx.fill();
        }

        // Node dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 + Math.sin(node.pulse) * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 100, ${nodeAlpha})`;
        ctx.shadowColor = "rgba(0, 255, 100, 0.5)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Matrix rain columns
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character - bright cyan-green
        ctx.fillStyle = `rgba(0, 255, 170, ${0.85 + Math.random() * 0.15})`;
        ctx.shadowColor = "rgba(0, 255, 170, 0.7)";
        ctx.shadowBlur = 10;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        // Trail
        for (let t = 1; t < 18; t++) {
          const trailY = y - t * fontSize;
          if (trailY < 0) break;
          const trailAlpha = Math.max(0, 0.45 - t * 0.025);
          const trailChar = chars[Math.floor(Math.random() * chars.length)];
          // Color shift from green to teal in trail
          const g = Math.floor(200 - t * 5);
          const b = Math.floor(50 + t * 8);
          ctx.fillStyle = `rgba(0, ${g}, ${b}, ${trailAlpha})`;
          ctx.fillText(trailChar, x, trailY);
        }

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }

      // Hex data blocks floating
      addHexBlock();
      for (let i = hexBlocks.length - 1; i >= 0; i--) {
        const hb = hexBlocks[i];
        hb.life++;
        if (hb.life < 20) {
          hb.alpha = hb.life / 20;
        } else if (hb.life > 100) {
          hb.alpha = Math.max(0, 1 - (hb.life - 100) / 30);
        }
        if (hb.life > 130) {
          hexBlocks.splice(i, 1);
          continue;
        }
        ctx.font = "11px 'Courier New', monospace";
        ctx.fillStyle = `rgba(0, 200, 180, ${hb.alpha * 0.5})`;
        ctx.fillText(hb.text, hb.x, hb.y);
        // Border box
        ctx.strokeStyle = `rgba(0, 200, 180, ${hb.alpha * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(hb.x - 4, hb.y - 12, 90, 16);
      }

      // Floating code snippets
      addCodeLine();
      for (let i = codeLines.length - 1; i >= 0; i--) {
        const cl = codeLines[i];
        cl.y += cl.speed;
        if (cl.y > canvas.height + 20) {
          codeLines.splice(i, 1);
          continue;
        }
        ctx.font = `${cl.fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(0, 180, 140, ${cl.alpha})`;
        ctx.fillText(cl.text, cl.x, cl.y);
      }

      // Horizontal scan line
      scanY += 0.8;
      if (scanY > canvas.height) scanY = 0;
      ctx.fillStyle = "rgba(0, 255, 120, 0.03)";
      ctx.fillRect(0, scanY, canvas.width, 2);
      ctx.fillStyle = "rgba(0, 255, 120, 0.015)";
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      // Mouse interaction - ripple & repel effect
      if (mouseX > 0 && mouseY > 0) {
        // Glow circle at cursor
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, MOUSE_RADIUS);
        grad.addColorStop(0, "rgba(0, 255, 180, 0.12)");
        grad.addColorStop(0.4, "rgba(0, 200, 140, 0.05)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(mouseX - MOUSE_RADIUS, mouseY - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2);

        // Pulsing ring
        const ringRadius = MOUSE_RADIUS * (0.6 + Math.sin(time * 0.08) * 0.15);
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 170, ${0.15 + Math.sin(time * 0.06) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 255, 170, 0.08)";
        ctx.stroke();

        // Binary burst around cursor
        ctx.font = "10px 'Courier New', monospace";
        for (let a = 0; a < 12; a++) {
          const angle = (a / 12) * Math.PI * 2 + time * 0.02;
          const dist = 40 + Math.sin(time * 0.05 + a) * 20;
          const bx = mouseX + Math.cos(angle) * dist;
          const by = mouseY + Math.sin(angle) * dist;
          const bchar = Math.random() > 0.5 ? "1" : "0";
          ctx.fillStyle = `rgba(0, 255, 170, ${0.3 + Math.sin(time * 0.1 + a) * 0.15})`;
          ctx.fillText(bchar, bx, by);
        }

        // Crosshair
        ctx.strokeStyle = "rgba(0, 255, 170, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(mouseX - 30, mouseY);
        ctx.lineTo(mouseX + 30, mouseY);
        ctx.moveTo(mouseX, mouseY - 30);
        ctx.lineTo(mouseX, mouseY + 30);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    ctx.fillStyle = "rgb(0, 2, 8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: "rgb(0, 2, 8)" }}
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
      <MatrixBackground />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center px-3 sm:px-4 py-4 gap-3 sm:gap-4 max-w-md mx-auto">
        {/* Date/Time Header */}
        <div className="w-full text-center text-white">
          <p className="text-lg sm:text-xl font-bold tracking-wide font-mono">
            DATA: {currentDateTime.toLocaleDateString('pt-BR')}, {currentDateTime.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        {/* Version & Sync Bar */}
        <div className="w-full flex flex-wrap items-center justify-between rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 sm:px-4 py-2 text-white text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs opacity-70">v{APP_VERSION}</span>
            {lastUpdated && (
              <span className="text-[10px] sm:text-xs opacity-50">
                • Atualizado: {new Date(lastUpdated).toLocaleDateString('pt-BR')} {new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
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
              Verificar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              disabled={isSyncing}
              className="h-6 sm:h-7 px-1.5 sm:px-2 text-white hover:bg-white/10 text-[10px] sm:text-xs gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Limpar Cache
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
