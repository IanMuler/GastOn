// Pantalla Balances - Dashboard y estadísticas
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { useDashboardSummary, useExpenseStatistics } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

type ViewMode = 'dashboard' | 'statistics';

export default function BalancesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  
  // React Query hooks
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboardSummary();
  
  const { 
    data: statisticsData, 
    isLoading: statisticsLoading, 
    error: statisticsError,
    refetch: refetchStatistics 
  } = useExpenseStatistics();

  const isLoading = dashboardLoading || statisticsLoading;
  const error = dashboardError || statisticsError;
  
  const handleRefresh = () => {
    refetchDashboard();
    refetchStatistics();
  };

  // Sub-components
  const TabButton = ({ mode, isActive, label }: { mode: ViewMode; isActive: boolean; label: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={() => setViewMode(mode)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SummaryCard = ({ title, value, icon, color }: {
    title: string;
    value: string;
    icon: string;
    color: string;
  }) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color={colors.surface} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );

  const CategoryCard = ({ category, total, percentage }: {
    category: any;
    total: number;
    percentage: number;
  }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
        <Text style={styles.categoryName}>{category.nombre}</Text>
        <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
      <Text style={styles.categoryAmount}>{formatCurrency(total)}</Text>
    </View>
  );

  // Loading and Error states
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al cargar estadísticas</Text>
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

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton mode="dashboard" isActive={viewMode === 'dashboard'} label="Dashboard" />
        <TabButton mode="statistics" isActive={viewMode === 'statistics'} label="Estadísticas" />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {viewMode === 'dashboard' ? (
          <View style={styles.dashboardContent}>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <SummaryCard
                title="Total del Mes"
                value={formatCurrency(dashboardData?.totalMes || 0)}
                icon="calendar-outline"
                color={colors.primary}
              />
              <SummaryCard
                title="Semana Actual"
                value={formatCurrency(dashboardData?.totalSemanaActual || 0)}
                icon="today-outline"
                color={colors.categories[0]}
              />
              <SummaryCard
                title="Promedio Diario"
                value={formatCurrency(dashboardData?.promedoDiario || 0)}
                icon="analytics-outline"
                color={colors.categories[1]}
              />
              <SummaryCard
                title="Cantidad de Gastos"
                value={String(dashboardData?.cantidadGastos || 0)}
                icon="list-outline"
                color={colors.categories[2]}
              />
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorías Más Usadas</Text>
              {dashboardData?.categoriasMasUsadas?.slice(0, 5).map((categoryBalance, index) => (
                <CategoryCard
                  key={index}
                  category={categoryBalance.categoria}
                  total={categoryBalance.total}
                  percentage={categoryBalance.porcentaje}
                />
              )) || (
                <Text style={styles.emptyText}>No hay datos de categorías</Text>
              )}
            </View>

            {/* Expense Names Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombres Más Frecuentes</Text>
              {dashboardData?.nombresMasUsados?.slice(0, 5).map((nameBalance, index) => (
                <View key={index} style={styles.nameCard}>
                  <Text style={styles.nameTitle}>{nameBalance.nombre.nombre}</Text>
                  <View style={styles.nameStats}>
                    <Text style={styles.nameAmount}>{formatCurrency(nameBalance.total)}</Text>
                    <Text style={styles.nameFrequency}>({nameBalance.frecuencia} veces)</Text>
                  </View>
                </View>
              )) || (
                <Text style={styles.emptyText}>No hay datos de nombres</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.statisticsContent}>
            {/* Statistics View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen del Período</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total del Período</Text>
                  <Text style={styles.statValue}>{formatCurrency(statisticsData?.totalPeriodo || 0)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Promedio Diario</Text>
                  <Text style={styles.statValue}>{formatCurrency(statisticsData?.promedioDiario || 0)}</Text>
                </View>
              </View>
            </View>

            {/* Categories Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Análisis por Categorías</Text>
              {statisticsData?.categorias?.map((categoryBalance, index) => (
                <CategoryCard
                  key={index}
                  category={categoryBalance.categoria}
                  total={categoryBalance.total}
                  percentage={categoryBalance.porcentaje}
                />
              )) || (
                <Text style={styles.emptyText}>No hay datos estadísticos</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.text,
  },
  
  // Content
  content: {
    flex: 1,
  },
  dashboardContent: {
    padding: spacing.md,
  },
  statisticsContent: {
    padding: spacing.md,
  },
  
  // Summary Cards Grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Category Cards
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  categoryPercentage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  categoryAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  // Name Cards
  nameCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nameTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
    flex: 1,
  },
  nameStats: {
    alignItems: 'flex-end',
  },
  nameAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  nameFrequency: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  
  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  
  // Empty States
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
  },
  
  // Loading and Error States
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