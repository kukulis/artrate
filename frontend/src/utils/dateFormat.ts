/**
 * Format a date to 'yyyy-mm-dd' format
 * @param date - Date object or string to format
 * @returns Formatted date string in 'yyyy-mm-dd' format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
