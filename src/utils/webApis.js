import { useCallback, useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true,
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [isSupported]);

  return { speak, stop, speaking, isSupported };
}

export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export async function shareContent({ title, text, url }) {
  if (navigator?.share) {
    try {
      await navigator.share({ title, text, url: url || window.location.href });
      return true;
    } catch (error) {
      if (error.name === "AbortError") return false;
    }
  }
  const copied = await copyToClipboard(url || window.location.href);
  if (!copied) {
    throw new Error("No se pudo compartir ni copiar el enlace.");
  }
  return true;
}

export async function toggleFullscreen(element) {
  const el = element || document.documentElement;
  if (!document.fullscreenElement) {
    if (el.requestFullscreen) return await el.requestFullscreen();
    if (el.webkitRequestFullscreen) return await el.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) return await document.exitFullscreen();
    if (document.webkitExitFullscreen) return await document.webkitExitFullscreen();
  }
  throw new Error("La pantalla completa no está disponible en este navegador.");
}
