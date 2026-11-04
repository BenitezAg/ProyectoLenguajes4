export function toCamelCaseRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase()),
      value,
    ]),
  );
}

export function toDatabaseRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      value,
    ]),
  );
}

export function normalizeMessageRecord(record) {
  return {
    ...toCamelCaseRecord(record),
    portfolioMessageReplies: (record.portfolio_message_replies ?? []).map(
      toCamelCaseRecord,
    ),
  };
}

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
