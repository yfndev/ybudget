export function parseVolksbankDate(dateString: string): number {
  const parts = dateString.split(/[/\-.]/);
  if (parts.length === 3) {
    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (first <= 31 && second <= 12) {
      return new Date(year, second - 1, first).getTime();
    }

    if (first <= 12 && second <= 31) {
      return new Date(year, first - 1, second).getTime();
    }
  }

  return Date.now();
}

export function parseSparkasseDate(dateString: string): number {
  const parts = dateString.split(".");
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    if (year < 100) {
      year += 2000;
    }

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return new Date(year, month - 1, day).getTime();
    }
  }

  return Date.now();
}
