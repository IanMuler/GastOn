// Utilidades de fechas - adaptadas del patrón timeTracker

export const DAYS_OF_WEEK_BASE = [
  { id: "mon", label: "Lun", index: 0 },
  { id: "tue", label: "Mar", index: 1 },
  { id: "wed", label: "Mié", index: 2 },
  { id: "thu", label: "Jue", index: 3 },
  { id: "fri", label: "Vie", index: 4 },
  { id: "sat", label: "Sáb", index: 5 },
  { id: "sun", label: "Dom", index: 6 },
];

export const getDaysOfWeek = (selectedDay: number, daysBase = DAYS_OF_WEEK_BASE) => {
  return daysBase.map((day, index) => ({
    ...day,
    isActive: index === selectedDay,
  }));
};

export const getCurrentWeekDates = () => {
  return getWeekDates(0);
};

/**
 * Get week dates with offset from current week
 * @param weekOffset - 0 for current week, -1 for previous week, 1 for next week
 */
export const getWeekDates = (weekOffset: number = 0) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(formatDate(date));
  }
  
  return {
    start: dates[0],
    end: dates[6],
    dates,
    weekOffset
  };
};

export const formatDate = (date: Date): string => {
  // Use local date to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentDay = (): number => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return currentDay === 0 ? 6 : currentDay - 1; // Convert to Monday = 0 format
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export const isToday = (dateString: string): boolean => {
  return dateString === formatDate(new Date());
};

/**
 * Format week range for display in header
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @param weekOffset - Week offset to determine if it's current week
 */
export const formatWeekRange = (startDate: string, endDate: string, weekOffset: number = 0): string => {
  if (weekOffset === 0) {
    return 'Esta semana';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Format: "Lun 13 Ene - Dom 19 Ene"
  const startFormatted = start.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  
  const endFormatted = end.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  
  // If same month, show: "Lun 13 - Dom 19 Ene"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const startShort = start.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric'
    });
    
    return `${startShort} - ${endFormatted}`;
  }
  
  // Different months: "Lun 30 Dic - Dom 5 Ene"
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Check if a week offset represents a future week
 */
export const isFutureWeek = (weekOffset: number): boolean => {
  return weekOffset > 0;
};

/**
 * Get the current day index for a specific week
 * Returns the day index that should be selected, or current day if it's current week
 */
export const getCurrentDayForWeek = (weekOffset: number): number => {
  if (weekOffset === 0) {
    return getCurrentDay();
  }
  // For past/future weeks, default to Monday (index 0)
  return 0;
};