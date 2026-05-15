import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield, Clock, ListChecks, BookOpen, Inbox, Users, Printer,
  HardDrive, Copy, Bell, Activity, LogIn, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";

const features = [
  { icon: ListChecks, title: "Procedimentos", desc: "Base centralizada de procedimentos com busca, notas de diagnóstico e nota oficial prontas para copiar." },
  { icon: Inbox, title: "Filas Remota e Presencial", desc: "Mova chamados entre filas, acompanhe status e use templates dinâmicos por tipo de atendimento." },
  { icon: Clock, title: "Cronômetro de WO", desc: "Timer crescente com ciclo de 40 minutos, alertas nativos em segundo plano e histórico de ordens concluídas." },
  { icon: BookOpen, title: "Manual & Documentação", desc: "Guias internos, atalho Alt+7, manual SIGESF com imagens interativas e contribuição por e-mail." },
  { icon: ListChecks, title: "Checklists Interativos", desc: "Roteiros guiados para os cenários de suporte mais comuns, do diagnóstico à conclusão." },
  { icon: Printer, title: "SIGESF Impressora", desc: "Procedimento completo para configuração de impressoras com prints do manual e troubleshooting." },
  { icon: HardDrive, title: "Robocopy & Formatação", desc: "Comandos prontos e roteiros de formatação para padronizar atendimentos de campo." },
  { icon: Bell, title: "Alertas Inteligentes", desc: "Notificações nativas de WO, lembretes de bem-estar e avisos de supervisores em tempo real." },
  { icon: Users, title: "Mensagens de Supervisores", desc: "Comunicados agendados com expiração e alerta sonoro para a equipe não perder nada." },
  { icon: Activity, title: "Histórico & Backup", desc: "Histórico cronológico, arquivamento automático e aviso antes de fechar com dados não salvos." },
  { icon: Copy, title: "Notas Destacadas", desc: "Botões em destaque para copiar nota de diagnóstico e nota oficial em um clique." },
  { icon: Shield, title: "Segurança", desc: "Acesso restrito por e-mail autorizado, RLS, bloqueio de DevTools e proteção anti-XSS." },
];

const stats = [
  { value: "40min", label: "Ciclo de WO monitorado" },
  { value: "100%", label: "Offline-ready (PWA)" },
  { value: "24/7", label: "Acesso a procedimentos" },
];

// Scroll-reveal: adds 'is-visible' when element enters viewport
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const Landing = () => {
  useReveal();
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Reveal styles */}
      <style>{`
        [data-reveal]{opacity:0;transform:translateY(30px);transition:opacity .7s ease-out,transform .7s ease-out}
        [data-reveal].is-visible{opacity:1;transform:none}
        [data-reveal-delay="1"]{transition-delay:.1s}
        [data-reveal-delay="2"]{transition-delay:.2s}
        [data-reveal-delay="3"]{transition-delay:.3s}
        [data-reveal-delay="4"]{transition-delay:.4s}
        .animated-gradient{background-size:200% 200%}
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary grid place-items-center text-white shadow-elevated animate-float">
              <Shield className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm md:text-base">Gestão de Procedimentos</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">Suporte Técnico Hepta</p>
            </div>
          </div>
          <Link to="/login">
            <Button size="sm" className="gap-2 hover:scale-105 transition-transform">
              <LogIn className="w-4 h-4" /> Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 animated-gradient animate-gradient-x" aria-hidden />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-blob" aria-hidden />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:3s]" aria-hidden />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-blob [animation-delay:6s]" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> Plataforma interna de suporte
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight animate-fade-in-up">
            Tudo que o técnico precisa,<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent animated-gradient animate-gradient-x">em um só lugar.</span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up [animation-delay:.15s]">
            Procedimentos, filas, checklists, manuais e timer de WO — desenhado para acelerar o atendimento técnico e reduzir erros.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up [animation-delay:.3s]">
            <Link to="/login">
              <Button size="lg" className="group relative gap-2 h-12 px-7 text-base font-semibold shadow-elevated hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Sparkles className="w-4 h-4" /> Acessar plataforma
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#recursos">
              <Button size="lg" variant="outline" className="gap-2 h-12 px-6 text-base hover:bg-primary/5 hover:border-primary transition-colors">
                Ver recursos
              </Button>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={s.label} className="text-center" data-reveal data-reveal-delay={String(i + 1)}>
                <p className="text-2xl md:text-4xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12" data-reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold">Recursos da plataforma</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Construída a partir da rotina real do suporte. Cada módulo resolve uma dor concreta do atendimento.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Card
              key={f.title}
              data-reveal
              data-reveal-delay={String((i % 4) + 1)}
              className="group p-5 border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/40"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center" data-reveal>
          <Link to="/login">
            <Button size="lg" className="gap-2 h-12 px-7 text-base font-semibold shadow-elevated hover:scale-105 transition-transform">
              Começar agora <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mb-12" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">Três passos para um atendimento mais rápido.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Faça login", d: "Acesso seguro restrito à equipe autorizada." },
              { n: "02", t: "Encontre o procedimento", d: "Busque, abra a leitura e copie a nota pronta em um clique." },
              { n: "03", t: "Acompanhe a WO", d: "Inicie o cronômetro, receba alertas e arquive ao concluir." },
            ].map((s, i) => (
              <div
                key={s.n}
                data-reveal
                data-reveal-delay={String(i + 1)}
                className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-elevated transition-all hover:-translate-y-1"
              >
                <span className="text-5xl font-extrabold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-110 inline-block transition-transform origin-left">{s.n}</span>
                <h3 className="mt-3 font-bold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
        <div
          data-reveal
          className="relative overflow-hidden rounded-2xl bg-gradient-primary animated-gradient animate-gradient-x p-10 md:p-16 shadow-elevated text-white"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-blob" aria-hidden />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-blob [animation-delay:4s]" aria-hidden />
          <div className="relative">
            <Sparkles className="w-10 h-10 mx-auto mb-3 animate-float" />
            <h2 className="text-3xl md:text-5xl font-extrabold">Pronto para acelerar seu atendimento?</h2>
            <p className="mt-3 text-white/90 max-w-xl mx-auto text-base md:text-lg">Faça login e tenha todos os procedimentos, filas e ferramentas à mão.</p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="mt-7 gap-2 h-14 px-8 text-base font-bold hover:scale-105 transition-transform shadow-2xl">
                <LogIn className="w-5 h-5" /> Entrar na plataforma <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Gestão de Procedimentos · Suporte Técnico Hepta · Desenvolvido por Marcondes Jorge Machado
      </footer>

      {/* Sticky floating CTA */}
      <div
        className={`fixed bottom-5 right-5 z-30 transition-all duration-500 ${
          showStickyCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <Link to="/login">
          <Button size="lg" className="gap-2 h-12 px-5 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-transform">
            <LogIn className="w-4 h-4" /> Entrar agora
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Landing;