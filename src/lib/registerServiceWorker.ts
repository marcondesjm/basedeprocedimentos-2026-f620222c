import { registerSW } from "virtual:pwa-register";

const isRunningInsideIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const isLovablePreviewHost = () =>
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

const unregisterPreviewServiceWorkers = () => {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
};

export const registerAppServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;

  if (isRunningInsideIframe() || isLovablePreviewHost()) {
    unregisterPreviewServiceWorkers();
    return;
  }

  registerSW({
    immediate: true,
    onRegisteredSW: (_swUrl, registration) => {
      registration?.update();
    },
  });
};