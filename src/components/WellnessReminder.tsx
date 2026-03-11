import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Droplets, StretchHorizontal, Eye, Coffee, Wind, Heart, Footprints, Smile } from "lucide-react";
import { SupervisorMessages } from "@/components/SupervisorMessages";

type ReminderCategory = "water" | "stretch" | "general";

interface Reminder {
  icon: React.ReactNode;
  message: string;
  color: string;
  category: ReminderCategory;
}

const reminders: Reminder[] = [
  // Água
  { icon: <Droplets className="w-6 h-6" />, message: "💧 Hora de beber água! Mantenha-se hidratado.", color: "text-sky-400", category: "water" },
  { icon: <Droplets className="w-6 h-6" />, message: "💧 Já bebeu água? Hidratação é essencial!", color: "text-sky-400", category: "water" },
  // Alongamento
  { icon: <StretchHorizontal className="w-6 h-6" />, message: "🧘 Faça um alongamento! Estique os braços e o pescoço.", color: "text-emerald-400", category: "stretch" },
  { icon: <StretchHorizontal className="w-6 h-6" />, message: "🤸 Gire os ombros e estique as costas!", color: "text-emerald-400", category: "stretch" },
  { icon: <Heart className="w-6 h-6" />, message: "💪 Alongue os pulsos e dedos. Previna lesões!", color: "text-rose-400", category: "stretch" },
  { icon: <Footprints className="w-6 h-6" />, message: "🚶 Levante e caminhe um pouco! Seu corpo agradece.", color: "text-orange-400", category: "stretch" },
  // Geral (exibido entre os ciclos)
  { icon: <Eye className="w-6 h-6" />, message: "👀 Descanse os olhos! Olhe para longe por 20 segundos.", color: "text-violet-400", category: "general" },
  { icon: <Coffee className="w-6 h-6" />, message: "☕ Que tal uma pausa rápida? Respire fundo.", color: "text-amber-400", category: "general" },
  { icon: <Wind className="w-6 h-6" />, message: "🌬️ Respire fundo! Inspire por 4s, segure 4s, expire 4s.", color: "text-cyan-400", category: "general" },
  { icon: <Heart className="w-6 h-6" />, message: "❤️ Cuide de você! Corrija sua postura agora.", color: "text-rose-400", category: "general" },
  { icon: <Eye className="w-6 h-6" />, message: "👁️ Regra 20-20-20: a cada 20min, olhe a 20 pés por 20s.", color: "text-violet-400", category: "general" },
  { icon: <Smile className="w-6 h-6" />, message: "😊 Você está indo bem! Continue focado.", color: "text-yellow-400", category: "general" },
];

const WATER_INTERVAL = 60 * 60 * 1000;     // 1 hora
const STRETCH_INTERVAL = 90 * 60 * 1000;   // 1h30

const getByCategory = (cat: ReminderCategory) => reminders.filter((r) => r.category === cat);

const pickRandom = (cat: ReminderCategory) => {
  const items = getByCategory(cat);
  return items[Math.floor(Math.random() * items.length)];
};

const pickGeneral = () => pickRandom("general");

export const WellnessReminder = () => {
  const [current, setCurrent] = useState<Reminder>(() => pickGeneral());
  const [isVisible, setIsVisible] = useState(true);

  const transition = useCallback((next: Reminder) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrent(next);
      setIsVisible(true);
    }, 1300);
  }, []);

  useEffect(() => {
    // Água a cada 1h
    const waterTimer = setInterval(() => transition(pickRandom("water")), WATER_INTERVAL);
    // Alongamento a cada 1h30
    const stretchTimer = setInterval(() => transition(pickRandom("stretch")), STRETCH_INTERVAL);
    // Mensagens gerais entre os ciclos (a cada 5 min)
    const generalTimer = setInterval(() => transition(pickGeneral()), 5 * 60 * 1000);

    return () => {
      clearInterval(waterTimer);
      clearInterval(stretchTimer);
      clearInterval(generalTimer);
    };
  }, [transition]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bem-estar */}
      <Card className="p-4 md:p-5 bg-gradient-to-br from-muted/20 to-muted/40 border-muted-foreground/10 flex items-center gap-4 overflow-hidden">
        <div
          className={`shrink-0 ${current.color}`}
          style={{
            transition: "opacity 1.2s ease-in-out, transform 1.2s ease-in-out",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.85)",
          }}
        >
          {current.icon}
        </div>
        <p
          className="text-sm md:text-base font-medium text-foreground/80"
          style={{
            transition: "opacity 1.2s ease-in-out, transform 1.2s ease-in-out",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(-8px)",
          }}
        >
          {current.message}
        </p>
      </Card>

      {/* Mensagens dos Supervisores */}
      <SupervisorMessages />
    </div>
  );
};
