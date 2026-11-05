import assert from "node:assert/strict";
import test from "node:test";
import { validateProfileDetails } from "./profile.js";

test("validates and normalizes required profile fields", () => {
  assert.deepEqual(
    validateProfileDetails({
      firstName: "  Ana ",
      lastName: " Pérez ",
      phone: "+54 9 11 1234-5678",
    }),
    {
      firstName: "Ana",
      lastName: "Pérez",
      phone: "+54 9 11 1234-5678",
      fullName: "Ana Pérez",
    },
  );
});

test("rejects incomplete or oversized names", () => {
  assert.throws(
    () => validateProfileDetails({ firstName: "A", lastName: "Pérez", phone: "12345678" }),
    /nombre y apellido/,
  );
  assert.throws(
    () => validateProfileDetails({
      firstName: "A".repeat(40),
      lastName: "B".repeat(40),
      phone: "12345678",
    }),
    /70 caracteres/,
  );
});

test("requires a valid phone on signup but allows legacy profiles without one", () => {
  assert.throws(
    () => validateProfileDetails({ firstName: "Ana", lastName: "Pérez", phone: "" }),
    /teléfono válido/,
  );
  assert.equal(
    validateProfileDetails(
      { firstName: "Ana", lastName: "Pérez", phone: "" },
      { requirePhone: false },
    ).phone,
    "",
  );
  assert.throws(
    () => validateProfileDetails({ firstName: "Ana", lastName: "Pérez", phone: "12345678abcd" }),
    /teléfono válido/,
  );
});
