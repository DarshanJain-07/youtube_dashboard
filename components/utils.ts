/**
 * Formats a number to a human-readable string with K, M, B suffixes
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num;
  
  if (numValue >= 1000000000) {
    return (numValue / 1000000000).toFixed(1) + 'B';
  }
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  return numValue.toString();
}