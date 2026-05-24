export const BASE_CURRENCY = 'ZAR';

export function formatMoney(value: number, currency = BASE_CURRENCY) {
  const amount = Number.isFinite(value) ? value : 0;

  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
