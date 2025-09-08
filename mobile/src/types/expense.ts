// Interfaces TypeScript para el sistema de gastos

export interface Category {
  id: number;
  nombre: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseName {
  id: number;
  nombre: string;
  categoria_sugerida_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  monto: number;
  fecha: string; // YYYY-MM-DD format
  categoria_id: number;
  nombre_gasto_id: number;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithDetails extends Expense {
  categoria: Category;
  nombre_gasto: ExpenseName;
}

// Para el balance y estadísticas
export interface Balance {
  totalMes: number;
  totalPorCategoria: CategoryBalance[];
  totalPorNombre: NameBalance[];
}

export interface CategoryBalance {
  categoria: Category;
  total: number;
  porcentaje: number;
}

export interface NameBalance {
  nombre: ExpenseName;
  total: number;
  frecuencia: number;
}

// Para la organización por días (adaptado de timeTracker)
export interface DayExpenses {
  date: string;
  dayName: string;
  expenses: ExpenseWithDetails[];
  totalAmount: number;
}

export interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  days: DayExpenses[];
  weekTotal: number;
}