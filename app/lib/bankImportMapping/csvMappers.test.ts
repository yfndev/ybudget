import { expect, test } from "vitest";
import { mapCSVRow } from "./csvMappers";

test("parses sparkasse date DD.MM.YY correctly", () => {
  const result = mapCSVRow(
    { Buchungstag: "15.03.24", Betrag: "0", Verwendungszweck: "test" },
    "sparkasse",
  );
  expect(new Date(result.date).getFullYear()).toBe(2024);
  expect(new Date(result.date).getMonth()).toBe(2);
  expect(new Date(result.date).getDate()).toBe(15);
});

test("parses sparkasse amount with German format", () => {
  const result = mapCSVRow(
    { Buchungstag: "01.01.24", Betrag: "1.234,56", Verwendungszweck: "test" },
    "sparkasse",
  );
  expect(result.amount).toBe(1234.56);
});

test("parses negative sparkasse amount", () => {
  const result = mapCSVRow(
    { Buchungstag: "01.01.24", Betrag: "-50,00", Verwendungszweck: "test" },
    "sparkasse",
  );
  expect(result.amount).toBe(-50);
});

test("parses volksbank date DD.MM.YYYY correctly", () => {
  const result = mapCSVRow(
    { Buchungstag: "15.03.2024", Betrag: "0", Verwendungszweck: "test" },
    "volksbank",
  );
  expect(new Date(result.date).getFullYear()).toBe(2024);
  expect(new Date(result.date).getMonth()).toBe(2);
  expect(new Date(result.date).getDate()).toBe(15);
});

test("parses moss date MM/DD/YYYY correctly", () => {
  const result = mapCSVRow(
    { "Payment Date": "03/15/2024", Amount: "100" },
    "moss",
  );
  expect(new Date(result.date).getFullYear()).toBe(2024);
  expect(new Date(result.date).getMonth()).toBe(2);
  expect(new Date(result.date).getDate()).toBe(15);
});

test("parses moss amount", () => {
  const result = mapCSVRow(
    { "Payment Date": "01/01/2024", Amount: "99.99" },
    "moss",
  );
  expect(result.amount).toBe(99.99);
});

test("returns 0 for empty amount", () => {
  const result = mapCSVRow(
    { Buchungstag: "01.01.24", Betrag: "", Verwendungszweck: "test" },
    "sparkasse",
  );
  expect(result.amount).toBe(0);
});

test("cleans sparkasse description from date patterns", () => {
  const result = mapCSVRow(
    {
      Buchungstag: "01.01.24",
      Betrag: "0",
      Verwendungszweck: "Payment DATUM 15.03.2024, 14.30 UHR done",
    },
    "sparkasse",
  );
  expect(result.description).toBe("Payment done");
});

test("cleans volksbank description from sensitive data", () => {
  const result = mapCSVRow(
    {
      Buchungstag: "01.01.2024",
      Betrag: "0",
      Verwendungszweck: "Payment IBAN: DE123456 MREF: ABC123 done",
    },
    "volksbank",
  );
  expect(result.description).toBe("Payment done");
});

test("parses moss date with correct format (DD/MM/YYYY)", () => {
  const result = mapCSVRow(
    { "Payment Date": "31/01/2024", Amount: "100" },
    "moss",
  );
  expect(new Date(result.date).getFullYear()).toBe(2024);
  expect(new Date(result.date).getMonth()).toBe(0);
  expect(new Date(result.date).getDate()).toBe(31);
});

test("creates new import id for sparkassen imports", () => {
  const result = mapCSVRow(
    { Buchungstag: "", Betrag: "100", Verwendungszweck: "" },
    "sparkasse",
  );
  expect(result.importedTransactionId).toMatch(/^sparkasse-\d+-/);
});

test("parse moss date returns current date if month/date is not correct", () => {
  const before = Date.now();
  const result = mapCSVRow(
    { "Payment Date": "99/99/2024", Amount: "100" },
    "moss",
  );
  const after = Date.now();
  expect(result.date).toBeGreaterThanOrEqual(before);
  expect(result.date).toBeLessThanOrEqual(after);
});

test("parseGermanDate fallback for invalid format", () => {
  const before = Date.now();
  const result = mapCSVRow(
    { Buchungstag: "invalid", Betrag: "0", Verwendungszweck: "test" },
    "sparkasse",
  );
  const after = Date.now();
  expect(result.date).toBeGreaterThanOrEqual(before);
  expect(result.date).toBeLessThanOrEqual(after);
});

test("parseMossDate fallback for invalid format", () => {
  const before = Date.now();
  const result = mapCSVRow({ "Payment Date": "2024", Amount: "0" }, "moss");
  const after = Date.now();
  expect(result.date).toBeGreaterThanOrEqual(before);
  expect(result.date).toBeLessThanOrEqual(after);
});

test("mapMoss with no date fields", () => {
  const before = Date.now();
  const result = mapCSVRow({ Amount: "100" }, "moss");
  const after = Date.now();
  expect(result.date).toBeGreaterThanOrEqual(before);
  expect(result.date).toBeLessThanOrEqual(after);
});
