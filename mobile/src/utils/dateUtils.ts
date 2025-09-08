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
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(formatDate(date));
  }
  
  return {
    start: dates[0],
    end: dates[6],
    dates
  };
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
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