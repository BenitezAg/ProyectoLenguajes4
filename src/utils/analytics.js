/**
 * Utilidades puras para el cálculo de analíticas y métricas del panel de operador.
 * Zona horaria de referencia: Argentina (UTC-3).
 */

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Convierte un Date, timestamp o string ISO a formato de fecha local "YYYY-MM-DD" en Argentina (UTC-3).
 * Si ya es un string "YYYY-MM-DD", lo devuelve directamente para evitar saltos de día.
 */
export function toArgentinaDateKey(dateInput) {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: ARGENTINA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    const offsetMs = -3 * 60 * 60 * 1000;
    const local = new Date(date.getTime() + offsetMs);
    const y = local.getUTCFullYear();
    const m = String(local.getUTCMonth() + 1).padStart(2, "0");
    const d = String(local.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

/**
 * Obtiene la fecha actual en Argentina en formato "YYYY-MM-DD".
 */
export function getArgentinaToday(now = new Date()) {
  return toArgentinaDateKey(now);
}

/**
 * Suma o resta días a una fecha "YYYY-MM-DD" sin desfases horarios.
 */
export function addDays(dateKey, amount) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Valida un rango de fechas.
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { isValid: false, error: "Debe especificar ambas fechas (Desde y Hasta)." };
  }
  const startKey = toArgentinaDateKey(startDate);
  const endKey = toArgentinaDateKey(endDate);
  if (startKey > endKey) {
    return {
      isValid: false,
      error: "La fecha 'Desde' no puede ser posterior a 'Hasta'.",
    };
  }
  return { isValid: true, error: null };
}

/**
 * Genera una secuencia continua de fechas "YYYY-MM-DD" entre startDate y endDate (ambas inclusive).
 */
export function generateDateSequence(startDate, endDate) {
  const validation = validateDateRange(startDate, endDate);
  if (!validation.isValid) return [];

  const startKey = toArgentinaDateKey(startDate);
  const endKey = toArgentinaDateKey(endDate);

  const dates = [];
  let currentKey = startKey;
  while (currentKey <= endKey) {
    dates.push(currentKey);
    currentKey = addDays(currentKey, 1);
  }
  return dates;
}

/**
 * Genera la etiqueta corta para el eje X de un día.
 */
export function formatDayLabel(dateKey, totalDays = 7) {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 15, 0, 0));

  if (totalDays > 14) {
    return `${d}/${m}`;
  }
  return new Intl.DateTimeFormat("es-AR", { weekday: "short" })
    .format(date)
    .replace(".", "");
}

/**
 * Genera una etiqueta completa descriptiva para tooltips y lectores de pantalla.
 */
export function formatFullDate(dateKey) {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 15, 0, 0));
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Agrupa las visitas diarias sobre una secuencia de fechas dada.
 */
export function groupVisitsByDay(dailyVisits = [], dateSequence = []) {
  const visitMap = new Map();
  for (const item of dailyVisits) {
    if (!item?.date) continue;
    const key = toArgentinaDateKey(item.date);
    const prev = visitMap.get(key) || { visits: 0, registered: 0 };
    visitMap.set(key, {
      visits: prev.visits + (Number(item.visits) || 0),
      registered: prev.registered + (Number(item.registered) || 0),
    });
  }

  return dateSequence.map((dateKey) => {
    const found = visitMap.get(dateKey);
    return {
      date: dateKey,
      label: formatDayLabel(dateKey, dateSequence.length),
      fullLabel: formatFullDate(dateKey),
      visits: found?.visits ?? 0,
      registered: found?.registered ?? 0,
    };
  });
}

/**
 * Agrupa usuarios registrados por día según createdAt en hora local de Argentina.
 */
export function groupUsersByDay(users = [], dateSequence = []) {
  const userMap = new Map();
  for (const user of users) {
    if (!user?.createdAt) continue;
    const key = toArgentinaDateKey(user.createdAt);
    userMap.set(key, (userMap.get(key) || 0) + 1);
  }

  return dateSequence.map((dateKey) => {
    const count = userMap.get(dateKey) ?? 0;
    return {
      date: dateKey,
      label: formatDayLabel(dateKey, dateSequence.length),
      fullLabel: formatFullDate(dateKey),
      count,
    };
  });
}

/**
 * Categorías estándar para consultas de mensajes.
 */
export const MESSAGE_CATEGORIES = [
  "Cotización",
  "Asesoría técnica",
  "Proyecto nuevo",
  "Otra consulta",
];

/**
 * Agrupa consultas por subject dentro del rango de fechas especificado.
 */
export function groupMessagesBySubject(messages = [], startDate, endDate) {
  const counts = {
    Cotización: 0,
    "Asesoría técnica": 0,
    "Proyecto nuevo": 0,
    "Otra consulta": 0,
  };

  const startKey = startDate ? toArgentinaDateKey(startDate) : null;
  const endKey = endDate ? toArgentinaDateKey(endDate) : null;

  let totalInRange = 0;

  for (const m of messages) {
    if (!m) continue;
    if (m.createdAt) {
      const msgDateKey = toArgentinaDateKey(m.createdAt);
      if (startKey && msgDateKey < startKey) continue;
      if (endKey && msgDateKey > endKey) continue;
    }
    totalInRange++;
    if (counts[m.subject] !== undefined) {
      counts[m.subject]++;
    } else {
      counts["Otra consulta"]++;
    }
  }

  return MESSAGE_CATEGORIES.map((type) => {
    const count = counts[type];
    return {
      type,
      count,
      pct: totalInRange > 0 ? Math.round((count / totalInRange) * 100) : 0,
    };
  });
}

/**
 * Calcula las métricas acumuladas correspondientes al período seleccionado.
 */
export function calculatePeriodMetrics({
  dailyVisits = [],
  users = [],
  messages = [],
  startDate,
  endDate,
}) {
  const startKey = startDate ? toArgentinaDateKey(startDate) : null;
  const endKey = endDate ? toArgentinaDateKey(endDate) : null;

  const inRange = (dateKey) => {
    if (!dateKey) return false;
    if (startKey && dateKey < startKey) return false;
    if (endKey && dateKey > endKey) return false;
    return true;
  };

  let periodVisits = 0;
  let periodRegisteredVisits = 0;
  for (const item of dailyVisits) {
    if (!item?.date) continue;
    const key = toArgentinaDateKey(item.date);
    if (inRange(key)) {
      periodVisits += Number(item.visits) || 0;
      periodRegisteredVisits += Number(item.registered) || 0;
    }
  }

  let periodUsersCount = 0;
  for (const u of users) {
    if (!u?.createdAt) continue;
    const key = toArgentinaDateKey(u.createdAt);
    if (inRange(key)) {
      periodUsersCount++;
    }
  }

  let periodMessagesCount = 0;
  let periodPendingMessagesCount = 0;
  const filteredMessages = [];
  for (const m of messages) {
    if (!m?.createdAt) continue;
    const key = toArgentinaDateKey(m.createdAt);
    if (inRange(key)) {
      filteredMessages.push(m);
      periodMessagesCount++;
      if (m.status === "nueva") {
        periodPendingMessagesCount++;
      }
    }
  }

  return {
    periodVisits,
    periodRegisteredVisits,
    periodUsersCount,
    periodMessagesCount,
    periodPendingMessagesCount,
    filteredMessages,
  };
}

/**
 * Obtiene la fecha más temprana registrada en todo el historial disponible.
 */
export function getHistoryEarliestDate({
  dailyVisits = [],
  users = [],
  messages = [],
  fallbackDate,
} = {}) {
  const dates = [];
  for (const v of dailyVisits) {
    if (v?.date) dates.push(toArgentinaDateKey(v.date));
  }
  for (const u of users) {
    if (u?.createdAt) dates.push(toArgentinaDateKey(u.createdAt));
  }
  for (const m of messages) {
    if (m?.createdAt) dates.push(toArgentinaDateKey(m.createdAt));
  }
  if (!dates.length) {
    return fallbackDate || getArgentinaToday();
  }
  dates.sort();
  return dates[0];
}
