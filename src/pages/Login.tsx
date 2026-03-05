import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, RefreshCw, Trash2, LogIn, Sun, Moon } from "lucide-react";

const APP_VERSION = '2.7.0';

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

    // === SPACE GAME ===
    const ship = { x: canvas.width / 2, y: canvas.height / 2, angle: 0, thrustAlpha: 0 };
    const lasers: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const enemies: { x: number; y: number; vx: number; vy: number; size: number; hp: number; type: number }[] = [];
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];
    const stars: { x: number; y: number; size: number; brightness: number; speed: number }[] = [];
    let score = 0;
    let lastShot = 0;
    let autoShootTimer = 0;

    // Generate stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        speed: 0.1 + Math.random() * 0.3,
      });
    }

    // Spawn enemies
    const spawnEnemy = () => {
      if (enemies.length < 12) {
        const side = Math.floor(Math.random() * 4);
        let ex = 0, ey = 0;
        if (side === 0) { ex = Math.random() * canvas.width; ey = -30; }
        else if (side === 1) { ex = canvas.width + 30; ey = Math.random() * canvas.height; }
        else if (side === 2) { ex = Math.random() * canvas.width; ey = canvas.height + 30; }
        else { ex = -30; ey = Math.random() * canvas.height; }
        const speed = 0.5 + Math.random() * 1.5;
        const angle = Math.atan2(canvas.height / 2 - ey, canvas.width / 2 - ex) + (Math.random() - 0.5) * 1;
        enemies.push({
          x: ex, y: ey,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 8 + Math.random() * 12,
          hp: 1,
          type: Math.floor(Math.random() * 3),
        });
      }
    };

    const explode = (x: number, y: number, count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30 + Math.random() * 20,
          color,
          size: 1 + Math.random() * 2,
        });
      }
    };

    const shootLaser = () => {
      if (time - lastShot < 8) return;
      lastShot = time;
      const speed = 8;
      lasers.push({
        x: ship.x + Math.cos(ship.angle) * 18,
        y: ship.y + Math.sin(ship.angle) * 18,
        vx: Math.cos(ship.angle) * speed,
        vy: Math.sin(ship.angle) * speed,
        life: 60,
      });
    };

    // Click to shoot
    const onClick = () => shootLaser();
    document.addEventListener("click", onClick);

    // Code snippets
    const codeSnippets = [
      "const init = () => {", "  await fetch('/api/data');", "if (status === 200) {",
      "  return response.json();", "export default App;", "import React from 'react';",
      "async function loadData() {", "  const result = await db", "try { connect(); }",
      "socket.on('message', cb);", "router.get('/health', ok);", "npm install --save-dev",
      "docker compose up -d", "git push origin main", "CREATE TABLE users (",
      "console.log('deployed');", "useEffect(() => {}, []);", "kubectl apply -f deploy.yml",
      "ssh root@192.168.1.100", "chmod 755 ./script.sh",
    ];
    const codeLines: { x: number; y: number; text: string; alpha: number; speed: number; fontSize: number }[] = [];

    const addCodeLine = () => {
      if (Math.random() < 0.02 && codeLines.length < 12) {
        codeLines.push({
          x: Math.random() * (canvas.width - 200), y: -20,
          text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
          alpha: 0.1 + Math.random() * 0.12, speed: 0.15 + Math.random() * 0.3,
          fontSize: 10 + Math.floor(Math.random() * 3),
        });
      }
    };

    let scanY = 0;

    const drawShip = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Engine glow
      ship.thrustAlpha = 0.5 + Math.sin(time * 0.3) * 0.3;
      const engineGrad = ctx.createRadialGradient(-12, 0, 0, -12, 0, 20);
      engineGrad.addColorStop(0, `rgba(0, 200, 255, ${ship.thrustAlpha * 0.6})`);
      engineGrad.addColorStop(0.5, `rgba(0, 100, 255, ${ship.thrustAlpha * 0.3})`);
      engineGrad.addColorStop(1, "transparent");
      ctx.fillStyle = engineGrad;
      ctx.fillRect(-32, -20, 20, 40);

      // Ship body
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-12, -10);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 255, 200, 0.8)";
      ctx.shadowColor = "rgba(0, 255, 200, 0.6)";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cockpit
      ctx.beginPath();
      ctx.arc(6, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();

      // Wings
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      ctx.lineTo(-14, -18);
      ctx.lineTo(-10, -10);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 200, 180, 0.6)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, 10);
      ctx.lineTo(-14, 18);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawEnemy = (e: { x: number; y: number; size: number; type: number }) => {
      ctx.save();
      ctx.translate(e.x, e.y);
      const pulse = Math.sin(time * 0.1 + e.x) * 0.2;

      if (e.type === 0) {
        // Asteroid
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = e.size * (0.7 + Math.sin(a * 3 + e.x) * 0.3);
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(180, 80, 60, ${0.5 + pulse})`;
        ctx.strokeStyle = `rgba(255, 120, 80, ${0.6 + pulse})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 1) {
        // Enemy ship
        ctx.rotate(time * 0.02 + e.y);
        ctx.beginPath();
        ctx.moveTo(0, -e.size);
        ctx.lineTo(e.size * 0.7, e.size * 0.5);
        ctx.lineTo(-e.size * 0.7, e.size * 0.5);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 50, 80, ${0.6 + pulse})`;
        ctx.shadowColor = "rgba(255, 50, 80, 0.5)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 100, 120, 0.7)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Drone (diamond)
        ctx.rotate(time * 0.03);
        ctx.beginPath();
        ctx.moveTo(0, -e.size);
        ctx.lineTo(e.size * 0.6, 0);
        ctx.lineTo(0, e.size);
        ctx.lineTo(-e.size * 0.6, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(200, 0, 255, ${0.5 + pulse})`;
        ctx.shadowColor = "rgba(200, 0, 255, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(220, 100, 255, 0.7)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    const resizeHandler = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -80);
      speeds = new Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);
    };
    window.addEventListener("resize", resizeHandler);

    const animate = () => {
      time++;

      // Dark fade
      ctx.fillStyle = "rgba(0, 2, 8, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars parallax
      for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        const twinkle = star.brightness * (0.7 + Math.sin(time * 0.05 + star.x) * 0.3);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${twinkle})`;
        ctx.fill();
      }

      // Subtle matrix rain (reduced)
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.4) continue; // render fewer
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = `rgba(0, 255, 170, ${0.15 + Math.random() * 0.1})`;
        ctx.fillText(char, x, y);
        if (y > canvas.height && Math.random() > 0.98) drops[i] = 0;
        drops[i] += speeds[i];
      }

      // Floating code snippets
      addCodeLine();
      for (let i = codeLines.length - 1; i >= 0; i--) {
        const cl = codeLines[i];
        cl.y += cl.speed;
        if (cl.y > canvas.height + 20) { codeLines.splice(i, 1); continue; }
        ctx.font = `${cl.fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(0, 180, 140, ${cl.alpha})`;
        ctx.fillText(cl.text, cl.x, cl.y);
      }

      // Scan line
      scanY += 0.6;
      if (scanY > canvas.height) scanY = 0;
      ctx.fillStyle = "rgba(0, 255, 120, 0.02)";
      ctx.fillRect(0, scanY, canvas.width, 2);

      // === GAME LOGIC ===
      // Ship follows mouse
      if (mouseX > 0 && mouseY > 0) {
        ship.x += (mouseX - ship.x) * 0.08;
        ship.y += (mouseY - ship.y) * 0.08;
        ship.angle = Math.atan2(mouseY - ship.y, mouseX - ship.x);
      }

      // Auto-shoot
      autoShootTimer++;
      if (autoShootTimer > 15 && enemies.length > 0) {
        autoShootTimer = 0;
        // Find nearest enemy
        let nearest = enemies[0];
        let minDist = Infinity;
        for (const e of enemies) {
          const d = Math.hypot(e.x - ship.x, e.y - ship.y);
          if (d < minDist) { minDist = d; nearest = e; }
        }
        ship.angle = Math.atan2(nearest.y - ship.y, nearest.x - ship.x);
        shootLaser();
      }

      // Spawn enemies
      if (time % 60 === 0) spawnEnemy();
      if (time % 120 === 0 && Math.random() > 0.5) spawnEnemy();

      // Update & draw lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.x += l.vx;
        l.y += l.vy;
        l.life--;
        if (l.life <= 0 || l.x < -20 || l.x > canvas.width + 20 || l.y < -20 || l.y > canvas.height + 20) {
          lasers.splice(i, 1); continue;
        }
        // Draw laser
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x - l.vx * 2, l.y - l.vy * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * (l.life / 60)})`;
        ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(l.x - e.x, l.y - e.y) < e.size + 4) {
            e.hp--;
            lasers.splice(i, 1);
            if (e.hp <= 0) {
              const colors = ["rgba(255,200,50,1)", "rgba(255,100,30,1)", "rgba(0,255,200,1)"];
              explode(e.x, e.y, 15, colors[e.type]);
              enemies.splice(j, 1);
              score++;
            }
            break;
          }
        }
      }

      // Update & draw enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx;
        e.y += e.vy;
        // Remove if far out of bounds
        if (e.x < -60 || e.x > canvas.width + 60 || e.y < -60 || e.y > canvas.height + 60) {
          enemies.splice(i, 1); continue;
        }
        drawEnemy(e);
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const alpha = p.life / 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("1)", `${alpha})`);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw ship
      drawShip(ship.x, ship.y, ship.angle);

      // Shield ring around ship
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 28 + Math.sin(time * 0.1) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 200, ${0.08 + Math.sin(time * 0.08) * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // HUD - Score
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.fillStyle = "rgba(0, 255, 200, 0.5)";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${String(score).padStart(4, '0')}`, 16, 30);
      ctx.fillText(`ENEMIES: ${enemies.length}`, 16, 48);

      // Crosshair at mouse
      if (mouseX > 0 && mouseY > 0) {
        ctx.strokeStyle = "rgba(0, 255, 200, 0.15)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX - 8, mouseY);
        ctx.lineTo(mouseX + 8, mouseY);
        ctx.moveTo(mouseX, mouseY - 8);
        ctx.lineTo(mouseX, mouseY + 8);
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
      document.removeEventListener("click", onClick);
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const navigate = useNavigate();

  // Dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
    toast.info('🔄 Limpando cache e atualizando...');
    await handleClearCache();
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
