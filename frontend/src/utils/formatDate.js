export const parseToISODate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.replace(/\//g, '-').split('-');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day && month && year && year.length === 4) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    return dateStr;
};

// Returns a normalized date only when the input is a real DD-MM-YYYY date.
// Date.parse is intentionally not used because it silently normalizes values
// such as 31-02-2026 instead of telling the user that the input is invalid.
export const parseStrictDate = (dateStr) => {
    const value = String(dateStr || '').trim().replace(/\//g, '-');
    if (!value) return null;

    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
    if (!match) return null;

    const [, dayText, monthText, yearText] = match;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) return null;

    return `${yearText}-${monthText}-${dayText}`;
};

