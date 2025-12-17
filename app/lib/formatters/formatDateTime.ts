export function formatDateTime(timestamp: number): string {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }
  