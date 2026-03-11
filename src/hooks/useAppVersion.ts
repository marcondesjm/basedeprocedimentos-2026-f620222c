import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const parseVersionPayload = (value: string | null | undefined) => {
  if (!value) return { version: "", buildTimestamp: null as string | null };

  const [versionPart, buildTimestamp] = value.split("|");
  return {
    version: versionPart.replace(/^v/i, ""),
    buildTimestamp: buildTimestamp ?? null,
  };
};

const compareSemver = (a: string, b: string) => {
  const aParts = a.split(".").map((part) => Number(part) || 0);
  const bParts = b.split(".").map((part) => Number(part) || 0);
  const maxLength = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const diff = (aParts[index] ?? 0) - (bParts[index] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

export function useAppVersion(APP_VERSION: string, BUILD_TIMESTAMP: string) {
  const [isAppUpToDate, setIsAppUpToDate] = useState<boolean | null>(
    () => localStorage.getItem("app_build_timestamp") === BUILD_TIMESTAMP
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshApp = useCallback(async () => {
    setIsSyncing(true);

    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }

      localStorage.removeItem("app_version");
      localStorage.removeItem("app_build_timestamp");

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      toast.success("Cache limpo! Recarregando...", { duration: 2000 });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast.error("Erro ao limpar cache");
      setIsSyncing(false);
    }
  }, []);

  const syncVersion = useCallback(async () => {
    const payloadValue = `${APP_VERSION}|${BUILD_TIMESTAMP}`;

    // Prevent reload loop: if we already tried reloading this session, don't reload again
    const alreadyReloaded = sessionStorage.getItem("app_version_reloaded");

    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value, updated_at")
        .eq("key", "current_version")
        .maybeSingle();

      if (error) throw error;

      const remote = parseVersionPayload(data?.value);

      if (data?.updated_at) {
        setLastUpdated(data.updated_at);
      }

      if (remote.buildTimestamp) {
        if (remote.buildTimestamp > BUILD_TIMESTAMP) {
          setIsAppUpToDate(false);
          if (!alreadyReloaded) {
            sessionStorage.setItem("app_version_reloaded", "true");
            toast.info("🔄 Atualização disponível! Recarregando...", { duration: 3000 });
            await refreshApp();
          }
          return;
        }

        if (remote.buildTimestamp < BUILD_TIMESTAMP) {
          sessionStorage.removeItem("app_version_reloaded");
          const { data: upserted, error: upsertError } = await supabase
            .from("app_config")
            .upsert({ key: "current_version", value: payloadValue }, { onConflict: "key" })
            .select("updated_at")
            .single();

          if (upsertError) throw upsertError;

          setLastUpdated(upserted?.updated_at ?? new Date().toISOString());
        }
      } else {
        const semverDiff = data?.value ? compareSemver(APP_VERSION, remote.version) : 1;

        if (!data || semverDiff >= 0) {
          sessionStorage.removeItem("app_version_reloaded");
          const { data: upserted, error: upsertError } = await supabase
            .from("app_config")
            .upsert({ key: "current_version", value: payloadValue }, { onConflict: "key" })
            .select("updated_at")
            .single();

          if (upsertError) throw upsertError;

          setLastUpdated(upserted?.updated_at ?? new Date().toISOString());
        } else {
          setIsAppUpToDate(false);
          if (!alreadyReloaded) {
            sessionStorage.setItem("app_version_reloaded", "true");
            toast.info("🔄 Nova versão detectada! Atualizando...", { duration: 3000 });
            await refreshApp();
          }
          return;
        }
      }

      setIsAppUpToDate(true);
      sessionStorage.removeItem("app_version_reloaded");
      localStorage.setItem("app_version", APP_VERSION);
      localStorage.setItem("app_build_timestamp", BUILD_TIMESTAMP);
    } catch (error) {
      console.error("Erro ao verificar versão:", error);
      setIsAppUpToDate(true);
    }
  }, [APP_VERSION, BUILD_TIMESTAMP, refreshApp]);

  useEffect(() => {
    let isActive = true;
    let pollDelay = 4000;
    let timeoutId: number | undefined;

    const schedulePoll = () => {
      if (!isActive) return;

      timeoutId = window.setTimeout(async () => {
        await syncVersion();
        pollDelay = Math.min(Math.round(pollDelay * 1.5), 30000);
        schedulePoll();
      }, pollDelay);
    };

    syncVersion();
    schedulePoll();

    const channel = supabase
      .channel("app-version-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_config", filter: "key=eq.current_version" },
        async () => {
          pollDelay = 4000;
          await syncVersion();
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [syncVersion]);

  return { isAppUpToDate, lastUpdated, isSyncing, refreshApp };
}

