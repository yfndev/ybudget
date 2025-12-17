import { describe, expect, it } from "vitest";
import { formatDateTime } from "./formatDateTime";

describe("formatDateTime", () => {
  it("formats timestamp to german date and time", () => {
    const timestamp = new Date("2024-03-15T14:30:00").getTime();
    const result = formatDateTime(timestamp);

    expect(result).toContain("15");
    expect(result).toContain("2024");
    expect(result).toContain("14:30");
  });
});
