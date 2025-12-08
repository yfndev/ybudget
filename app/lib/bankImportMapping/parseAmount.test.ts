import { expect, test } from "vitest";
import { parseAmount } from "./parseAmount";

test("correctly converts amount", () => {
  expect(parseAmount("1.234,56")).toBe(1234.56);
});

test("correctly converts negative amount", () => {
  expect(parseAmount("-50,00")).toBe(-50);
});

test("correctly converts decimal only", () => {
  expect(parseAmount("0,99")).toBe(0.99);
});

test("correctly converts empty string to 0", () => {
  expect(parseAmount("")).toBe(0);
});
