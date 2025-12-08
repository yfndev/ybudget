import { expect, test } from "vitest";
import { parseSparkasseDate } from "./parseDate";

test("parses DD.MM.YY into correct date", () => {
  const result = parseSparkasseDate("15.03.24");
  expect(new Date(result).getFullYear()).toBe(2024);
  expect(new Date(result).getMonth()).toBe(2);
  expect(new Date(result).getDate()).toBe(15);
});

test("parses first day of year", () => {
  const result = parseSparkasseDate("01.01.25");
  expect(new Date(result).getFullYear()).toBe(2025);
  expect(new Date(result).getMonth()).toBe(0);
});