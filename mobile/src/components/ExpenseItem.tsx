// Componente individual de gasto - adaptado de TaskItem de timeTracker
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ExpenseWithDetails } from '@/types/expense';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing, componentSpacing } from '@/styles/spacing';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseItemProps {
  expense: ExpenseWithDetails;
  onPress?: (expense: ExpenseWithDetails) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress }) => {
  const handlePress = () => {
    onPress?.(expense);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {expense.nombre_gasto.nombre}
        </Text>
      </View>
      <View style={styles.durationContainer}>
        <Text style={styles.duration}>
          {formatCurrency(expense.monto)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 72,
    gap: spacing.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  durationContainer: {
    flexShrink: 0,
  },
  duration: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    color: colors.text,
  },
});