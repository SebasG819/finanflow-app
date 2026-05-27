export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

export const formatSignedCurrency = (value: number) => {
  const sign = value > 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(value))}`;
};

export const getPercent = (current: number, target: number) =>
  Math.min(Math.round((current / target) * 100), 100);
