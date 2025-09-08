// Sistema tipográfico adaptado de timeTracker
export const typography = {
  // Tamaños de fuente - siguiendo el patrón de timeTracker
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  
  // Weights - igual que timeTracker
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights - valores absolutos para React Native  
  lineHeights: {
    tight: 22,
    normal: 24,
    relaxed: 28,
  },
};

// Estilos específicos para componentes (basados en timeTracker)
export const textStyles = {
  // Headers
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  
  // Tabs
  tabLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  
  // Secciones de categorías
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  
  // Items de gasto
  itemTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  
  itemSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
  },
  
  // Montos
  amount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
};