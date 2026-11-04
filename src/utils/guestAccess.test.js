import assert from "node:assert/strict";
import test from "node:test";
import {
  createGuestAccess,
  createGuestAccessUrl,
  getGuestAccessToken,
} from "./guestAccess.js";

test("creates a random guest token and a SHA-256 hash without exposing the token in the hash", async () => {
  const first = await createGuestAccess();
  const second = await createGuestAccess();

  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(first.hash, /^[0-9a-f]{64}$/);
  assert.notEqual(first.token, first.hash);
  assert.notEqual(first.token, second.token);
});

test("extracts a guest access token from the private URL fragment", () => {
  const token = "A".repeat(43);

  assert.equal(getGuestAccessToken(`#consulta=${token}`), token);
  assert.equal(getGuestAccessToken("#inicio"), "");
  assert.equal(getGuestAccessToken(`#consulta=${"A".repeat(20)}`), "");
});

test("creates a guest tracking URL using the private fragment", () => {
  assert.equal(
    createGuestAccessUrl("secret-token", {
      origin: "https://example.test",
      pathname: "/portfolio/",
      search: "?campaign=demo",
    }),
    "https://example.test/portfolio/?campaign=demo#consulta=secret-token",
  );
});
