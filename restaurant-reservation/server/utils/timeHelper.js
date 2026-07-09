/**
 * Converts a time string in 'HH:MM' 24-hour format to minutes from midnight.
 * @param {string} timeStr - Time string, e.g. "10:30"
 * @returns {number} Minutes, e.g. 630
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if two time ranges overlap.
 * @param {string} start1 - Start time of first range (HH:MM)
 * @param {string} end1 - End time of first range (HH:MM)
 * @param {string} start2 - Start time of second range (HH:MM)
 * @param {string} end2 - End time of second range (HH:MM)
 * @returns {boolean} True if they overlap, false otherwise
 */
export const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Checks standard interval overlap:
  // Overlap occurs if start1 < end2 AND end1 > start2
  return s1 < e2 && e1 > s2;
};

/**
 * Validates if a reservation date and start time are in the past.
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string (HH:MM)
 * @returns {boolean} True if the date/time is in the past, false otherwise
 */
export const isPastDateTime = (dateStr, timeStr) => {
  const now = new Date();
  
  // Format current date in local YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${date}`;

  if (dateStr < todayStr) {
    return true;
  }

  if (dateStr === todayStr) {
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentHHMM = `${currentHours}:${currentMinutes}`;
    
    return timeStr < currentHHMM;
  }

  return false;
};
