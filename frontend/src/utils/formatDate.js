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

