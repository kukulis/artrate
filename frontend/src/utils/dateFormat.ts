/**
 * Format a date to 'yyyy-mm-dd' format
 * @param date - Date object or string to format
 * @returns Formatted date string in 'yyyy-mm-dd' format
 */
export function formatDate(date: Date | string | null): string {
    if (date == null) {
        return '-'
    }

    const d = typeof date === 'string' ? new Date(date) : date

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Format a date to 'yyyy-mm-dd HH:MM:SS' format
 * @param date - Date object or string to format
 * @returns Formatted date string in 'yyyy-mm-dd HH:MM:SS' format
 */
export function formatDateTime(date: Date | string | null): string {
    if (date == null) {
        return '-'
    }

    const d = typeof date === 'string' ? new Date(date) : date

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
