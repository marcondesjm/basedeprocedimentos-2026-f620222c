import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Droplets, StretchHorizontal, Eye, Coffee, Wind, Heart, Footprints, Smile } from "lucide-react";

interface Reminder {
  icon: React.ReactNode;
  message: string;
  color: string;
}

const reminders: Reminder[] = [
  { icon: <Droplets className="w-6 h-6" />, message: "💧 Hora de beber água! Mantenha-se hidratado.", color: "text-sky-400" },
  { icon: <StretchHorizontal className="w-6 h-6" />, message: "🧘 Faça um alongamento! Estique os braços e o pescoço.", color: "text-emerald-400" },
  { icon: <Eye className="w-6 h-6" />, message: "👀 Descanse os olhos! Olhe para longe por 20 segundos.", color: "text-violet-400" },
  { icon: <Coffee className="w-6 h-6" />, message: "☕ Que tal uma pausa rápida? Respire fundo.", color: "text-amber-400" },
  { icon: <Wind className="w-6 h-6" />, message: "🌬️ Respire fundo! Inspire por 4s, segure 4s, expire 4s.", color: "text-cyan-400" },
  { icon: <Heart className="w-6 h-6" />, message: "❤️ Cuide de você! Corrija sua postura agora.", color: "text-rose-400" },
  { icon: <Footprints className="w-6 h-6" />, message: "🚶 Levante e caminhe um pouco! Seu corpo agradece.", color: "text-orange-400" },
  { icon: <Smile className="w-6 h-6" />, message: "😊 Você está indo bem! Continue focado.", color: "text-yellow-400" },
  { icon: <Droplets className="w-6 h-6" />, message: "💧 Já bebeu água? Hidratação é essencial!", color: "text-sky-400" },
  { icon: <StretchHorizontal className="w-6 h-6" />, message: "🤸 Gire os ombros e estique as costas!", color: "text-emerald-400" },
  { icon: <Eye className="w-6 h-6" />, message: "👁️ Regra 20-20-20: a cada 20min, olhe a 20 pés por 20s.", color: "text-violet-400" },
  { icon: <Heart className="w-6 h-6" />, message: "💪 Alongue os pulsos e dedos. Previna lesões!", color: "text-rose-400" },
];

const INTERVAL_MS = 5 * 60 * 1000; // troca a cada 5 minutos

export const WellnessReminder = () => {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * reminders.length));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reminders.length);
        setIsVisible(true);
      }, 500);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const reminder = reminders[currentIndex];

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-muted/20 to-muted/40 border-muted-foreground/10 flex items-center gap-4 overflow-hidden">
      <div
        className={`shrink-0 ${reminder.color} transition-all duration-500 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        {reminder.icon}
      </div>
      <p
        className={`text-sm md:text-base font-medium text-foreground/80 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {reminder.message}
      </p>
    </Card>
  );
};
