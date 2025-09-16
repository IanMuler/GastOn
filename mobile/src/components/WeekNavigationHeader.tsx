import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { formatWeekRange, isFutureWeek } from '@/utils/dateUtils';

interface WeekNavigationHeaderProps {
  weekOffset: number;
  startDate: string;
  endDate: string;
  onWeekChange: (offset: number) => void;
  isLoading?: boolean;
}

export const WeekNavigationHeader: React.FC<WeekNavigationHeaderProps> = ({
  weekOffset,
  startDate,
  endDate,
  onWeekChange,
  isLoading = false
}) => {
  const canGoPrevious = true; // Always allow going to previous weeks
  const canGoNext = !isFutureWeek(weekOffset + 1); // Don't allow future weeks
  
  const weekRangeText = formatWeekRange(startDate, endDate, weekOffset);
  
  const handlePreviousWeek = () => {
    if (canGoPrevious && !isLoading) {
      onWeekChange(weekOffset - 1);
    }
  };
  
  const handleNextWeek = () => {
    if (canGoNext && !isLoading) {
      onWeekChange(weekOffset + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.arrowButton,
          !canGoPrevious && styles.arrowButtonDisabled
        ]}
        onPress={handlePreviousWeek}
        disabled={!canGoPrevious || isLoading}
        accessibilityLabel="Semana anterior"
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={!canGoPrevious || isLoading ? colors.textTertiary : colors.text}
        />
      </TouchableOpacity>

      <View style={styles.weekRangeContainer}>
        {isLoading ? (
          <View style={styles.loadingSkeleton} />
        ) : (
          <Text style={styles.weekRangeText}>
            {weekRangeText}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.arrowButton,
          !canGoNext && styles.arrowButtonDisabled
        ]}
        onPress={handleNextWeek}
        disabled={!canGoNext || isLoading}
        accessibilityLabel="Semana siguiente"
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={!canGoNext || isLoading ? colors.textTertiary : colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  arrowButton: {
    padding: spacing.sm,
    borderRadius: 8,
    minWidth: 44, // Accessibility touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  
  weekRangeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  
  weekRangeText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  loadingSkeleton: {
    height: 20,
    width: 140,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
});