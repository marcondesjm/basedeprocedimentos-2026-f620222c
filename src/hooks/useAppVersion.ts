import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAppVersion(APP_VERSION: string) {
  const [isAppUpToDate, setIsAppUpToDate] = useState(() => localStorage.getItem('app_version') === APP_VERSION);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'current_version')
          .single();

        if (data && data.value !== APP_VERSION) {
          toast.info('🔄 Nova versão detectada! Atualizando...', { duration: 3000 });
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }
          localStorage.removeItem('app_version');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setIsAppUpToDate(true);
          localStorage.setItem('app_version', APP_VERSION);
        }
      } catch (error) {
        console.error('Erro ao verificar versão:', error);
      }
    };

    checkVersion();

    const channel = supabase
      .channel('app-version-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_config', filter: 'key=eq.current_version' },
        (payload) => {
          const newVersion = payload.new?.value;
          if (newVersion && newVersion !== APP_VERSION) {
            toast.info('🔄 Atualização disponível! Recarregando...', { duration: 3000 });
            if ('caches' in window) {
              caches.keys().then(names => names.forEach(name => caches.delete(name)));
            }
            localStorage.removeItem('app_version');
            setTimeout(() => window.location.reload(), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isAppUpToDate };
}
