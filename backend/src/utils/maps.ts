export function record2string(record: Record<string, any>): string {
    const result: string[] = []

    for (const key in record) {
        const value = record[key];
        result.push(key + ':' + value)
    }

    return result.join('; ')
}