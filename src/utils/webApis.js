import { useEffect, useState } from "react";

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

  const speak = (text) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

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
  return copyToClipboard(url || window.location.href);
}

export function toggleFullscreen(element) {
  const el = element || document.documentElement;
  if (!document.fullscreenElement) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }
}
