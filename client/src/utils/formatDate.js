// src/utils/formatDate.js

/**
 * Format a Date object into a human-readable date/time string.
 * e.g. "18 June 2026, 11:31 PM"
 * @param {Date} date
 * @returns {string}
 */
export const formatDateTime = (date = new Date()) => {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
