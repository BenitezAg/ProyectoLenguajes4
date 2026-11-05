import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  calculatePeriodMetrics,
  formatDayLabel,
  formatFullDate,
  generateDateSequence,
  getArgentinaToday,
  getHistoryEarliestDate,
  groupMessagesBySubject,
  groupUsersByDay,
  groupVisitsByDay,
  toArgentinaDateKey,
  validateDateRange,
} from "./analytics.js";

test("converts UTC timestamps to Argentina local date (UTC-3) without shifting YYYY-MM-DD strings", () => {
  // 01:30 UTC el 4 de nov corresponde a las 22:30 del 3 de nov en Argentina (UTC-3)
  assert.equal(toArgentinaDateKey("2026-11-04T01:30:00.000Z"), "2026-11-03");

  // 18:00 UTC el 4 de nov corresponde a las 15:00 del 4 de nov en Argentina (UTC-3)
  assert.equal(toArgentinaDateKey("2026-11-04T18:00:00.000Z"), "2026-11-04");

  // Si ya viene como YYYY-MM-DD (como en dailyVisits), no debe mutar
  assert.equal(toArgentinaDateKey("2026-11-04"), "2026-11-04");
  assert.equal(toArgentinaDateKey(""), "");
});

test("calculates today date for Argentina accurately", () => {
  const fixedNow = new Date("2026-11-04T02:00:00Z"); // 23:00 del 2026-11-03 en UTC-3
  assert.equal(getArgentinaToday(fixedNow), "2026-11-03");

  const todayStr = getArgentinaToday();
  assert.match(todayStr, /^\d{4}-\d{2}-\d{2}$/);
});

test("adds and subtracts days across months without timezone distortion", () => {
  assert.equal(addDays("2026-11-01", -1), "2026-10-31");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-11-04", -6), "2026-10-29");
});

test("validates date ranges and detects when startDate is after endDate", () => {
  const valid = validateDateRange("2026-10-28", "2026-11-04");
  assert.equal(valid.isValid, true);
  assert.equal(valid.error, null);

  const sameDay = validateDateRange("2026-11-04", "2026-11-04");
  assert.equal(sameDay.isValid, true);

  const invalid = validateDateRange("2026-11-05", "2026-11-04");
  assert.equal(invalid.isValid, false);
  assert.match(invalid.error, /no puede ser posterior/i);

  const missing = validateDateRange("", "2026-11-04");
  assert.equal(missing.isValid, false);
});

test("generates a continuous date sequence between start and end dates", () => {
  const seq = generateDateSequence("2026-10-30", "2026-11-02");
  assert.deepEqual(seq, [
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
    "2026-11-02",
  ]);

  // Si startDate > endDate devuelve arreglo vacío
  assert.deepEqual(generateDateSequence("2026-11-04", "2026-11-01"), []);
});

test("formats short and full date labels for chart navigation and tooltips", () => {
  const shortLabel = formatDayLabel("2026-11-04", 7);
  assert.ok(shortLabel.length > 0);

  const monthDayLabel = formatDayLabel("2026-11-04", 30);
  assert.equal(monthDayLabel, "4/11");

  const fullLabel = formatFullDate("2026-11-04");
  assert.match(fullLabel, /4/);
  assert.match(fullLabel, /2026/);
});

test("groups visits by day over a specified date sequence", () => {
  const dailyVisits = [
    { date: "2026-11-01", visits: 10, registered: 2 },
    { date: "2026-11-03", visits: 25, registered: 8 },
  ];
  const dateSequence = ["2026-11-01", "2026-11-02", "2026-11-03"];

  const grouped = groupVisitsByDay(dailyVisits, dateSequence);

  assert.equal(grouped.length, 3);
  assert.deepEqual(grouped[0], {
    date: "2026-11-01",
    label: grouped[0].label,
    fullLabel: grouped[0].fullLabel,
    visits: 10,
    registered: 2,
  });
  // El día 2 no tiene visitas registradas: debe tener 0
  assert.equal(grouped[1].visits, 0);
  assert.equal(grouped[1].registered, 0);

  assert.equal(grouped[2].visits, 25);
  assert.equal(grouped[2].registered, 8);
});

test("groups new user registrations per day according to createdAt in Argentina timezone", () => {
  const users = [
    // 02:00 UTC el 2 de nov -> 23:00 el 1 de nov en Argentina (UTC-3)
    { id: "u1", createdAt: "2026-11-02T02:00:00Z" },
    // 15:00 UTC el 2 de nov -> 12:00 el 2 de nov en Argentina
    { id: "u2", createdAt: "2026-11-02T15:00:00Z" },
    // 16:00 UTC el 2 de nov -> 13:00 el 2 de nov en Argentina
    { id: "u3", createdAt: "2026-11-02T16:00:00Z" },
  ];
  const dateSequence = ["2026-11-01", "2026-11-02", "2026-11-03"];

  const grouped = groupUsersByDay(users, dateSequence);

  assert.equal(grouped.length, 3);
  assert.equal(grouped[0].date, "2026-11-01");
  assert.equal(grouped[0].count, 1);

  assert.equal(grouped[1].date, "2026-11-02");
  assert.equal(grouped[1].count, 2);

  assert.equal(grouped[2].date, "2026-11-03");
  assert.equal(grouped[2].count, 0);
});

test("groups messages by subject and calculates percentage strictly within date range", () => {
  const messages = [
    { id: "m1", subject: "Cotización", createdAt: "2026-11-01T14:00:00Z" },
    { id: "m2", subject: "Cotización", createdAt: "2026-11-02T14:00:00Z" },
    { id: "m3", subject: "Asesoría técnica", createdAt: "2026-11-02T15:00:00Z" },
    { id: "m4", subject: "Proyecto nuevo", createdAt: "2026-11-03T10:00:00Z" },
    { id: "m5", subject: "Consulta extra", createdAt: "2026-11-03T11:00:00Z" },
    // Fuera de rango (octubre)
    { id: "m6", subject: "Cotización", createdAt: "2026-10-25T10:00:00Z" },
  ];

  const distribution = groupMessagesBySubject(messages, "2026-11-01", "2026-11-03");

  const cotizacion = distribution.find((d) => d.type === "Cotización");
  const asesoria = distribution.find((d) => d.type === "Asesoría técnica");
  const proyecto = distribution.find((d) => d.type === "Proyecto nuevo");
  const otra = distribution.find((d) => d.type === "Otra consulta");

  // Total en rango = 5 mensajes
  assert.equal(cotizacion.count, 2);
  assert.equal(cotizacion.pct, 40); // 2/5 = 40%

  assert.equal(asesoria.count, 1);
  assert.equal(asesoria.pct, 20); // 1/5 = 20%

  assert.equal(proyecto.count, 1);
  assert.equal(proyecto.pct, 20);

  assert.equal(otra.count, 1);
  assert.equal(otra.pct, 20);
});

test("handles empty messages without division by zero errors", () => {
  const distribution = groupMessagesBySubject([], "2026-11-01", "2026-11-03");
  for (const item of distribution) {
    assert.equal(item.count, 0);
    assert.equal(item.pct, 0);
  }
});

test("calculates period metrics across visits, users, and messages correctly", () => {
  const dailyVisits = [
    { date: "2026-10-25", visits: 100, registered: 20 },
    { date: "2026-11-01", visits: 50, registered: 10 },
    { date: "2026-11-02", visits: 30, registered: 5 },
  ];
  const users = [
    { id: "u1", createdAt: "2026-10-20T00:00:00Z" },
    { id: "u2", createdAt: "2026-11-01T12:00:00Z" },
    { id: "u3", createdAt: "2026-11-02T12:00:00Z" },
  ];
  const messages = [
    { id: "m1", status: "nueva", createdAt: "2026-11-01T10:00:00Z" },
    { id: "m2", status: "respondida", createdAt: "2026-11-02T10:00:00Z" },
    { id: "m3", status: "nueva", createdAt: "2026-10-20T10:00:00Z" },
  ];

  const metrics = calculatePeriodMetrics({
    dailyVisits,
    users,
    messages,
    startDate: "2026-11-01",
    endDate: "2026-11-04",
  });

  assert.equal(metrics.periodVisits, 80);
  assert.equal(metrics.periodRegisteredVisits, 15);
  assert.equal(metrics.periodUsersCount, 2);
  assert.equal(metrics.periodMessagesCount, 2);
  assert.equal(metrics.periodPendingMessagesCount, 1);
  assert.equal(metrics.filteredMessages.length, 2);
});

test("finds the earliest date in historical records", () => {
  const earliest = getHistoryEarliestDate({
    dailyVisits: [{ date: "2026-10-28" }],
    users: [{ createdAt: "2026-10-26T12:00:00Z" }],
    messages: [{ createdAt: "2026-10-29T10:00:00Z" }],
    fallbackDate: "2026-11-01",
  });

  assert.equal(earliest, "2026-10-26");

  const fallback = getHistoryEarliestDate({
    dailyVisits: [],
    users: [],
    messages: [],
    fallbackDate: "2026-10-01",
  });
  assert.equal(fallback, "2026-10-01");
});
