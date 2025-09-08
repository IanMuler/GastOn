// Utilidades de formateo para moneda y números

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols and parse as float
  const cleanInput = input.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanInput);
  return isNaN(parsed) ? 0 : parsed;
};