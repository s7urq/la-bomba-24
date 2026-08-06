export function formatPesos(value: number): string {
  return `$${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value)}`;
}
