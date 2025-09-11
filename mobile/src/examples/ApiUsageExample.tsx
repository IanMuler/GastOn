/**
 * Example showing how to use the new API system in GastOn
 * 
 * This demonstrates the React Query hooks with TypeScript type safety
 */

import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import {
  useCategories,
  useCreateCategory,
  useCurrentWeekExpenses,
  useCreateExpense,
  useDashboardSummary,
  useSearchCategories
} from '@/services/api';

export const ApiUsageExample: React.FC = () => {
  // Query hooks - fetch data with caching and error handling
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();

  const { 
    data: weeklyExpenses, 
    isLoading: expensesLoading 
  } = useCurrentWeekExpenses();

  const { 
    data: dashboard, 
    isLoading: dashboardLoading 
  } = useDashboardSummary();

  // Mutation hooks - create/update/delete operations
  const createCategoryMutation = useCreateCategory({
    onSuccess: () => {
      Alert.alert('Éxito', 'Categoría creada correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      Alert.alert('Éxito', 'Gasto creado correctamente');
    }
  });

  // Example handlers
  const handleCreateCategory = () => {
    createCategoryMutation.mutate({
      body: {
        nombre: 'Nueva Categoría',
        color: '#FF6B6B'
      }
    });
  };

  const handleCreateExpense = () => {
    if (!categories || categories.categories.length === 0) {
      Alert.alert('Error', 'Primero crea una categoría');
      return;
    }

    createExpenseMutation.mutate({
      body: {
        monto: 1500,
        fecha: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD
        categoria_id: categories.categories[0].id,
        nombre_gasto_id: 1, // Assuming expense name exists
        descripcion: 'Gasto de ejemplo desde la nueva API'
      }
    });
  };

  if (categoriesLoading || expensesLoading || dashboardLoading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (categoriesError) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Error: {categoriesError.message}</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        API Usage Example
      </Text>

      {/* Categories Section */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Categorías ({categories?.categories.length || 0})
      </Text>
      {categories?.categories.map((category) => (
        <Text key={category.id} style={{ marginBottom: 5 }}>
          • {category.nombre} ({category.color})
        </Text>
      ))}

      <Button
        title="Crear Nueva Categoría"
        onPress={handleCreateCategory}
        disabled={createCategoryMutation.isPending}
      />

      {/* Weekly Expenses Section */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
        Gastos de la Semana
      </Text>
      <Text>Total: ${weeklyExpenses?.weekTotal || 0}</Text>
      <Text>Días con gastos: {weeklyExpenses?.days.filter(d => d.expenses.length > 0).length || 0}</Text>

      <Button
        title="Crear Nuevo Gasto"
        onPress={handleCreateExpense}
        disabled={createExpenseMutation.isPending}
      />

      {/* Dashboard Section */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
        Dashboard
      </Text>
      <Text>Total del mes: ${dashboard?.totalMes || 0}</Text>
      <Text>Promedio diario: ${dashboard?.promedoDiario || 0}</Text>
      <Text>Cantidad de gastos: {dashboard?.cantidadGastos || 0}</Text>

      {/* API Features Demonstration */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
        Características de la Nueva API
      </Text>
      <Text>• ✅ Tipos compartidos entre backend y frontend</Text>
      <Text>• ✅ Validación automática de tipos TypeScript</Text>
      <Text>• ✅ Cache automático con TanStack Query</Text>
      <Text>• ✅ Manejo centralizado de errores</Text>
      <Text>• ✅ Invalidación automática de cache</Text>
      <Text>• ✅ Estados de loading/error incluidos</Text>
      <Text>• ✅ Reintentos automáticos</Text>
    </View>
  );
};

// Example of using individual hooks in components
export const CategoryListExample: React.FC = () => {
  const { data, isLoading, error } = useCategories();

  if (isLoading) return <Text>Cargando categorías...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {data?.categories.map((category) => (
        <View key={category.id} style={{ flexDirection: 'row', padding: 10 }}>
          <View 
            style={{ 
              width: 20, 
              height: 20, 
              backgroundColor: category.color, 
              marginRight: 10 
            }} 
          />
          <Text>{category.nombre}</Text>
        </View>
      ))}
    </View>
  );
};

// Example of using search functionality
export const CategorySearchExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const { data: searchResults } = useSearchCategories(searchTerm, {
    // Only search if there's a search term
    enabled: searchTerm.length > 0
  });

  return (
    <View>
      <Text>Buscar categorías...</Text>
      {/* In a real component, you'd have a TextInput here */}
      {searchResults?.categories.map((category) => (
        <Text key={category.id}>{category.nombre}</Text>
      ))}
    </View>
  );
};