// Sistema de espaciado consistente - adaptado de timeTracker
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Espaciado específico para componentes
export const componentSpacing = {
  // Para elementos de lista (como en timeTracker)
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 72,
  },
  
  // Para headers
  header: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  
  // Para tabs
  tab: {
    paddingVertical: spacing.md,
    paddingBottom: 13, // Valor específico de timeTracker
  },
  
  // Para secciones
  section: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  }
};