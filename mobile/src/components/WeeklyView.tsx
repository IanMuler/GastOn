// Vista semanal principal - adaptada directamente de timeTracker
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseWithDetails } from '@/types/api';
import { ExpenseItem } from './ExpenseItem';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing, componentSpacing } from '@/styles/spacing';
import { 
  getDaysOfWeek, 
  getCurrentDay, 
  getCurrentWeekDates 
} from '@/utils/dateUtils';
import { useCurrentWeekExpenses } from '@/services/api';
import { Category } from '@/types/api';

export const WeeklyView: React.FC = () => {
  /* States */
  const [selectedDay, setSelectedDay] = useState(getCurrentDay()); // Default to current day
  
  // Get current week data with React Query
  const { 
    data: weeklyData, 
    isLoading, 
    error, 
    refetch 
  } = useCurrentWeekExpenses();
  
  // Get current week dates
  const { dates } = getCurrentWeekDates();
  const selectedDateString = dates[selectedDay];
  
  // Find the selected day data from the weekly response
  const selectedDayData = (weeklyData?.days || []).find(day => day.date === selectedDateString);
  const dayExpenses = selectedDayData?.expenses || [];
  
  // Organize expenses by category for the selected day
  const expensesByCategory = dayExpenses.reduce((acc, expense) => {
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
  
  /* Handlers */
  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex);
  };
  
  const handleAddExpense = () => {
    console.log('Add expense clicked');
    // TODO: Open modal or navigate to add expense screen
  };

  const handleRefresh = () => {
    refetch();
  };
  
  const handleExpensePress = (expense: ExpenseWithDetails) => {
    console.log('Expense pressed:', expense);
    // TODO: Open edit modal
  };

  /* Sub-components */
  const DayTabs = (
    <View style={styles.tabContainer}>
      <View style={styles.tabsContainer}>
        {getDaysOfWeek(selectedDay).map((day, index) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.tab,
              day.isActive && styles.tabActive
            ]}
            onPress={() => handleDaySelect(index)}
          >
            <Text style={[
              styles.tabText,
              day.isActive ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const CategorySection = ({ categoryName, categoryData }: {
    categoryName: string;
    categoryData: { categoria: any; expenses: ExpenseWithDetails[] };
  }) => {
    const hasActiveItems = categoryData.expenses.length > 0;
    
    return (
      <View key={categoryName}>
        <View style={styles.categoryHeader}>
          <View 
            style={[
              styles.categoryDot, 
              { backgroundColor: categoryData.categoria.color }
            ]} 
          />
          <Text style={[
            styles.categoryTitle,
            !hasActiveItems && styles.categoryTitleDisabled
          ]}>
            {categoryName}
          </Text>
        </View>
        {categoryData.expenses.length === 0 ? (
          <Text style={styles.emptyText}>Sin gastos</Text>
        ) : (
          categoryData.expenses.map((expense) => (
            <ExpenseItem 
              key={expense.id}
              expense={expense}
              onPress={handleExpensePress}
            />
          ))
        )}
      </View>
    );
  };

  // Loading and Error States
  if (isLoading) {
    return (
      <View style={styles.container}>
        {DayTabs}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando gastos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {DayTabs}
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al cargar gastos</Text>
          <Text style={styles.errorSubtitle}>
            {error instanceof Error ? error.message : 'Error desconocido'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const ExpensesList = (
    <ScrollView 
      style={styles.expensesContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {Object.keys(expensesByCategory).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
          <Text style={styles.emptySubtitle}>¡Agrega tu primer gasto del día!</Text>
        </View>
      ) : (
        Object.entries(expensesByCategory).map(([categoryName, categoryData]) => (
          <CategorySection 
            key={categoryName}
            categoryName={categoryName}
            categoryData={categoryData}
          />
        ))
      )}
    </ScrollView>
  );

  const FloatingActionButton = (
    <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
      <Ionicons name="add" size={28} color={colors.surface} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {DayTabs}
      {ExpensesList}
      {FloatingActionButton}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Tab styles - exactly like timeTracker
  tabContainer: {
    paddingBottom: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: componentSpacing.tab.paddingVertical,
    paddingBottom: componentSpacing.tab.paddingBottom,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  tabTextActive: {
    color: colors.text,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
  
  // Category section styles - like timeTracker
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: componentSpacing.section.paddingTop,
    paddingBottom: componentSpacing.section.paddingBottom,
    paddingHorizontal: componentSpacing.section.paddingHorizontal,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  categoryTitleDisabled: {
    color: colors.textTertiary,
  },
  
  // Expenses list
  expensesContainer: {
    flex: 1,
  },
  
  // Empty states - like timeTracker
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.surface,
  },
});