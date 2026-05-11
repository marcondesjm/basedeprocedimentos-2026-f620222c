const VERSION_STORAGE_KEY = "app_version";
const BUILD_STORAGE_KEY = "app_build_timestamp";
const REFRESH_STORAGE_KEY = "app_refresh_requested_at";

const waitForControllerChange = () =>
  new Promise<void>((resolve) => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      resolve();
      return;
    }

    const timeout = window.setTimeout(resolve, 1500);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });

export const markCurrentBuildVersion = (appVersion: string, buildTimestamp: string) => {
  localStorage.setItem(VERSION_STORAGE_KEY, appVersion.replace(/^v/i, ""));
  localStorage.setItem(BUILD_STORAGE_KEY, buildTimestamp);
};

export const clearAppCachesAndServiceWorkers = async () => {
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map(async (registration) => {
        try {
          await registration.update();
        } catch {
          // If update() fails because the old worker is already stale/offline, cleanup continues.
        }

        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        registration.installing?.postMessage({ type: "SKIP_WAITING" });
        registration.active?.postMessage({ type: "SKIP_WAITING" });
      }),
    );

    await waitForControllerChange();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
};

export const reloadBypassingServiceWorkerCache = () => {
  localStorage.setItem(REFRESH_STORAGE_KEY, new Date().toISOString());

  const url = new URL(window.location.href);
  url.searchParams.set("app-refresh", Date.now().toString());
  window.location.replace(url.toString());
};

export const refreshAppShell = async (appVersion: string, buildTimestamp: string) => {
  markCurrentBuildVersion(appVersion, buildTimestamp);
  await clearAppCachesAndServiceWorkers();
  reloadBypassingServiceWorkerCache();
};