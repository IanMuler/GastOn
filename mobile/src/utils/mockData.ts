// Datos mock para desarrollo - inspirados en timeTracker pero para gastos
import { Category, ExpenseName, ExpenseWithDetails } from '@/types/api';
import { colors } from '@/styles/colors';
import { getCurrentWeekDates, formatDate } from './dateUtils';

export const CATEGORIES_MOCK: Category[] = [
  { id: 1, nombre: "Comida", color: colors.categories[0], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 2, nombre: "Transporte", color: colors.categories[1], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 3, nombre: "Entretenimiento", color: colors.categories[2], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 4, nombre: "Salud", color: colors.categories[3], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 5, nombre: "Hogar", color: colors.categories[4], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 6, nombre: "Otros", color: colors.categories[5], created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }
];

export const EXPENSE_NAMES_MOCK: ExpenseName[] = [
  { id: 1, nombre: "Almuerzo", categoria_sugerida_id: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 2, nombre: "Supermercado", categoria_sugerida_id: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 3, nombre: "Uber", categoria_sugerida_id: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 4, nombre: "Colectivo", categoria_sugerida_id: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 5, nombre: "Cine", categoria_sugerida_id: 3, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 6, nombre: "Farmacia", categoria_sugerida_id: 4, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 7, nombre: "Limpieza", categoria_sugerida_id: 5, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// Generar gastos mock para la semana actual
const generateMockExpenses = (): ExpenseWithDetails[] => {
  const { dates } = getCurrentWeekDates();
  const expenses: ExpenseWithDetails[] = [];
  
  // Crear algunos gastos para diferentes días
  const mockExpensesData = [
    // Lunes
    { fecha: dates[0], categoria_id: 1, nombre_gasto_id: 1, monto: 850 }, // Almuerzo
    { fecha: dates[0], categoria_id: 2, nombre_gasto_id: 4, monto: 150 }, // Colectivo
    
    // Martes  
    { fecha: dates[1], categoria_id: 1, nombre_gasto_id: 2, monto: 3500 }, // Supermercado
    { fecha: dates[1], categoria_id: 2, nombre_gasto_id: 3, monto: 1200 }, // Uber
    
    // Miércoles
    { fecha: dates[2], categoria_id: 1, nombre_gasto_id: 1, monto: 950 }, // Almuerzo
    { fecha: dates[2], categoria_id: 4, nombre_gasto_id: 6, monto: 450 }, // Farmacia
    
    // Jueves
    { fecha: dates[3], categoria_id: 3, nombre_gasto_id: 5, monto: 2800 }, // Cine
    { fecha: dates[3], categoria_id: 1, nombre_gasto_id: 1, monto: 750 }, // Almuerzo
    
    // Viernes
    { fecha: dates[4], categoria_id: 2, nombre_gasto_id: 3, monto: 800 }, // Uber
    { fecha: dates[4], categoria_id: 5, nombre_gasto_id: 7, monto: 600 }, // Limpieza
    
    // Sábado
    { fecha: dates[5], categoria_id: 1, nombre_gasto_id: 2, monto: 2100 }, // Supermercado
    
    // Domingo - sin gastos para mostrar día vacío
  ];
  
  mockExpensesData.forEach((expenseData, index) => {
    const categoria = CATEGORIES_MOCK.find(c => c.id === expenseData.categoria_id)!;
    const nombreGasto = EXPENSE_NAMES_MOCK.find(n => n.id === expenseData.nombre_gasto_id)!;
    
    expenses.push({
      id: index + 1,
      monto: expenseData.monto,
      fecha: expenseData.fecha,
      categoria_id: expenseData.categoria_id,
      nombre_gasto_id: expenseData.nombre_gasto_id,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      categoria,
      nombre_gasto: nombreGasto
    });
  });
  
  return expenses;
};

export const EXPENSES_MOCK = generateMockExpenses();

// Función para obtener gastos por día (similar a timeTracker)
export const getExpensesByCategory = (expenses: ExpenseWithDetails[]) => {
  return expenses.reduce((acc, expense) => {
    const categoryName = expense.categoria.nombre;
    if (!acc[categoryName]) {
      acc[categoryName] = {
        categoria: expense.categoria,
        expenses: [],
      };
    }
    acc[categoryName].expenses.push(expense);
    return acc;
  }, {} as Record<string, { categoria: Category; expenses: ExpenseWithDetails[] }>);
};

export const getExpenseStateForDate = (expenseId: number, expenses: ExpenseWithDetails[], selectedDate: string) => {
  const hasExpense = expenses.some(
    expense => expense.id === expenseId && expense.fecha === selectedDate
  );
  return { hasExpense };
};

export const getCategoryStateForDate = (expenses: ExpenseWithDetails[], selectedDate: string, categoryId: number) => {
  const hasActiveItems = expenses.some(
    expense => expense.categoria_id === categoryId && expense.fecha === selectedDate
  );
  return { hasActiveItems };
};