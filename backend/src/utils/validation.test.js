import test from "node:test";
import assert from "node:assert/strict";
import {
  isNonEmptyString,
  isValidServiceType,
  isValidYear,
  parseInteger,
  parsePositiveNumber,
  parseValidDate,
} from "./validation.js";

test("validates non-empty strings", () => {
  assert.equal(isNonEmptyString("Golf 7"), true);
  assert.equal(isNonEmptyString("   "), false);
  assert.equal(isNonEmptyString(null), false);
});

test("parses integer input", () => {
  assert.equal(parseInteger("2020"), 2020);
  assert.equal(parseInteger("2020.5"), null);
  assert.equal(parseInteger("abc"), null);
});

test("validates year ranges", () => {
  assert.equal(isValidYear(2020), true);
  assert.equal(isValidYear(1800), false);
  assert.equal(isValidYear(new Date().getFullYear() + 2), false);
});

test("parses positive numeric values", () => {
  assert.equal(parsePositiveNumber("25.5"), 25.5);
  assert.equal(parsePositiveNumber("0"), null);
  assert.equal(parsePositiveNumber("-1"), null);
});

test("validates dates and service types", () => {
  assert.ok(parseValidDate("2026-06-23") instanceof Date);
  assert.equal(parseValidDate("not-a-date"), null);
  assert.equal(isValidServiceType("MALI"), true);
  assert.equal(isValidServiceType("UNKNOWN"), false);
});
