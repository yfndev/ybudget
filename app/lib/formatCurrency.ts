export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(amount));