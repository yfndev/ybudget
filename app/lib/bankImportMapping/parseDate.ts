export function parseDate(dateString: string): number {
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }

  const parts = dateString.split(/[/\-.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
    const usParsed = new Date(
      parseInt(parts[2]),
      parseInt(parts[0]) - 1,
      parseInt(parts[1]),
    );
    if (!isNaN(usParsed.getTime())) {
      return usParsed.getTime();
    }
  }

  return Date.now();
}
