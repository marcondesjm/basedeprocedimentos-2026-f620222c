import { useEffect, useState } from "react";

export const DeveloperContextMenu = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const menuW = 280;
      const menuH = 130;
      const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
      const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
      setPos({ x, y });
    };

    const handleClose = () => setPos(null);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClose);
    document.addEventListener("scroll", handleClose, true);
    window.addEventListener("blur", handleClose);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClose);
      document.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("blur", handleClose);
    };
  }, []);

  if (!pos) return null;

  return (
    <div
      role="menu"
      aria-label="Informações do desenvolvedor"
      className="fixed z-[9999] w-[280px] rounded-lg border border-primary/40 bg-popover/95 backdrop-blur shadow-elevated p-3 animate-in fade-in zoom-in-95"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-primary text-base">==(-_-)==</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Desenvolvedor
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-foreground">Marcondes Jorge Machado</p>
        <a
          href="mailto:marcondesgestaotrafego@gmail.com"
          className="block text-xs text-primary hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          marcondesgestaotrafego@gmail.com
        </a>
      </div>
    </div>
  );
};
