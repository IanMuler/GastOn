// Paleta de colores adaptada del proyecto timeTracker
export const colors = {
  // Colores base - manteniendo la estética del timeTracker
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#0D80F2',
  secondary: '#49739C',
  text: '#0D141C',
  textSecondary: '#49739C',
  textTertiary: '#6B7280',
  
  // Colores para categorías de gastos - inspirados en timeTracker pero adaptados
  categories: [
    '#EF4444', // Rojo - Comida
    '#3B82F6', // Azul - Transporte  
    '#8B5CF6', // Violeta - Entretenimiento
    '#10B981', // Verde - Salud
    '#F59E0B', // Amarillo - Hogar
    '#6B7280', // Gris - Otros
  ],
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0D80F2',
  
  // Bordes y separadores - igual que timeTracker
  border: '#E7EDF4',
  divider: '#E5E7EB',
  
  // Colores adicionales para gastos
  expense: {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
  }
};