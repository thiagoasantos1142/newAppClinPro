export function formatCurrencyInputBRL(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  const amount = Number(digits || 0) / 100;

  return `R$ ${amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseCurrencyInputBRL(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return Number(digits || 0) / 100;
}
