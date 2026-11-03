/**
 * Utility functions for date formatting
 */

export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  return d.toLocaleDateString('vi-VN');
}

export function formatDayMonthYear(date) {
  return formatDate(date, 'DD/MM/YYYY');
}

export function getDaysRemaining(targetDate) {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

