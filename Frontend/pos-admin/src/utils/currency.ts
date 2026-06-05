/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 180.000")
 * 
 * Format Indonesia:
 * - Rp 180.000 (pemisah ribuan: titik)
 * - Rp 1.234.567 (tidak ada desimal untuk Rupiah)
 */
export function formatCurrency(amount: number): string {
  // Round to nearest integer for Rupiah (no cents)
  const rounded = Math.round(amount);
  
  // Format using Indonesian locale
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  
  return formatted;
}

/**
 * Format number to Indonesian Rupiah with decimal places
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted currency string
 * 
 * Example:
 * - formatCurrencyDecimal(180000, 2) => "Rp 180.000,00"
 */
export function formatCurrencyDecimal(amount: number, decimals: number = 0): string {
  return `Rp ${amount.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
