import test from "node:test";
import assert from "node:assert/strict";
import {
  createId,
  formatDate,
  toCamelCaseRecord,
  toDatabaseRecord,
} from "./records.js";

test("converts database records and column names without losing Unicode data", () => {
  const project = {
    project_id: "tienda",
    registered_visits: 12,
    visit_date: "2026-10-31",
    title: "Ilustración editorial",
  };
  const converted = toCamelCaseRecord(project);

  assert.deepEqual(converted, {
    projectId: "tienda",
    registeredVisits: 12,
    visitDate: "2026-10-31",
    title: "Ilustración editorial",
  });
  assert.deepEqual(toDatabaseRecord(converted), project);
});

test("creates uniquely namespaced IDs that the database accepts", () => {
  const first = createId("projects");
  const second = createId("projects");

  assert.match(first, /^projects-[0-9a-f-]{36}$/);
  assert.notEqual(first, second);
});

test("formats valid database dates for the intended audience", () => {
  assert.match(formatDate("2026-10-31T12:00:00.000Z"), /2026/);
});
