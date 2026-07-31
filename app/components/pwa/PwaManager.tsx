"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "nk-hotel-os-pwa-dismissed-at";
const DISMISS_DAYS = 7;

export default function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.register("/sw.js?v=8", { updateViaCache: "none" }).then(value => {
      registration = value;
      if (registration.waiting) setUpdateReady(true);

      registration.addEventListener("updatefound", () => {
        const worker = registration?.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    }).catch(error => console.error("Hotel OS service worker registration failed.", error));

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    const updateTimer = window.setInterval(() => void registration?.update(), 60 * 60 * 1000);

    return () => {
      window.clearInterval(updateTimer);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    const dismissedRecently =
      dismissedAt > 0 &&
      Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;

    const mobile = window.matchMedia("(max-width: 860px)").matches;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);

      if (!standalone && !dismissedRecently && mobile) {
        window.setTimeout(() => setShowInstall(true), 1400);
      }
    };

    if (ios && !standalone && !dismissedRecently && mobile) {
      window.setTimeout(() => setShowIosHelp(true), 1600);
    }

    const onlineState = () => setOffline(!navigator.onLine);
    onlineState();

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("online", onlineState);
    window.addEventListener("offline", onlineState);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("online", onlineState);
      window.removeEventListener("offline", onlineState);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowInstall(false);
    }

    setInstallPrompt(null);
  }

  function dismissInstall() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowInstall(false);
    setShowIosHelp(false);
  }

  function applyUpdate() {
    navigator.serviceWorker.getRegistration().then(registration => {
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
  }

  return (
    <>
      {offline && (
        <div className="pwa-network-status" role="status">
          <i /> Offline - live data will resume when connected
        </div>
      )}

      {showInstall && installPrompt && (
        <aside className="pwa-install-card" aria-label="Install N K Hotel OS">
          <div className="pwa-install-icon">NK</div>
          <div className="pwa-install-copy">
            <strong>Install N K Hotel OS</strong>
            <small>Open faster from your phone home screen</small>
          </div>
          <button className="install" onClick={install}>
            <Download size={16} />
            Install
          </button>
          <button className="dismiss" onClick={dismissInstall} aria-label="Dismiss install prompt">
            <X size={17} />
          </button>
        </aside>
      )}

      {showIosHelp && (
        <aside className="pwa-install-card pwa-ios-card" aria-label="Install N K Hotel OS on iPhone">
          <div className="pwa-install-icon">NK</div>
          <div className="pwa-install-copy">
            <strong>Install N K Hotel OS</strong>
            <small><Share2 size={13} /> Tap Share, then Add to Home Screen</small>
          </div>
          <button className="dismiss" onClick={dismissInstall} aria-label="Dismiss install instructions">
            <X size={17} />
          </button>
        </aside>
      )}

      {updateReady && (
        <aside className="pwa-update-card" role="status">
          <div>
            <strong>Hotel OS update ready</strong>
            <small>Refresh to use the newest version</small>
          </div>
          <button onClick={applyUpdate}>Update</button>
        </aside>
      )}
    </>
  );
}
