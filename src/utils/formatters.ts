// ── Formateo de moneda en soles peruanos ──
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);

// ── Formateo de fecha legible ──
export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

// ── Fecha corta (Lun 23) ──
export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric' }).format(d);
};

// ── Nombre del día (Lun, Mar...) ──
export const getDayLabel = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(d);
};

// ── Fecha de hoy en YYYY-MM-DD ──
export const hoy = (): string => new Date().toISOString().split('T')[0];

// ── Primer día del mes actual ──
export const inicioMes = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

// ── Formateo de porcentaje con signo ──
export const formatPct = (n: number): string => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
};

// ── Compacto para grandes números (1.2K, 3.4M) ──
export const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
};
