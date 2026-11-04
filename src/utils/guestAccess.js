export async function createGuestAccess() {
  if (!globalThis.crypto?.getRandomValues || !globalThis.crypto?.subtle) {
    throw new Error(
      "Este navegador no permite crear un enlace privado de seguimiento. Abre el portfolio en HTTPS o localhost.",
    );
  }

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return { token, hash };
}

export function getGuestAccessToken(hash = window.location.hash) {
  const match = hash.match(/^#consulta=([A-Za-z0-9_-]{32,128})$/);
  return match?.[1] ?? "";
}

export function createGuestAccessUrl(token, location = window.location) {
  return `${location.origin}${location.pathname}${location.search}#consulta=${encodeURIComponent(token)}`;
}
