import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, ExpenseName, CreateExpenseRequest } from '@/types/api';
import { useCategories, useExpenseNames, useCreateExpense } from '@/services/api';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD format
  onSuccess?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onSuccess
}) => {
  // Form state
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedExpenseName, setSelectedExpenseName] = useState<ExpenseName | null>(null);
  const [description, setDescription] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showExpenseNamePicker, setShowExpenseNamePicker] = useState(false);
  
  // API hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: expenseNames, isLoading: expenseNamesLoading } = useExpenseNames();
  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      handleSuccess();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Error al crear el gasto');
    }
  });

  // Update date when selectedDate prop changes
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setAmount('');
    setDate(selectedDate);
    setSelectedCategory(null);
    setSelectedExpenseName(null);
    setDescription('');
    setShowCategoryPicker(false);
    setShowExpenseNamePicker(false);
  };

  const handleSuccess = () => {
    resetForm();
    onSuccess?.();
    onClose();
    Alert.alert('Éxito', 'Gasto creado exitosamente');
  };

  const validateForm = (): string | null => {
    if (!amount || parseFloat(amount) <= 0) {
      return 'El monto debe ser mayor a 0';
    }
    if (!selectedCategory) {
      return 'Debes seleccionar una categoría';
    }
    if (!selectedExpenseName) {
      return 'Debes seleccionar un nombre de gasto';
    }
    if (!date) {
      return 'Debes seleccionar una fecha';
    }
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de validación', validationError);
      return;
    }

    const expenseData: CreateExpenseRequest = {
      monto: parseFloat(amount),
      fecha: date,
      categoria_id: selectedCategory!.id,
      nombre_gasto_id: selectedExpenseName!.id,
      descripcion: description.trim() || undefined
    };

    createExpenseMutation.mutate({ body: expenseData });
  };

  const filteredExpenseNames = expenseNames?.filter(name => 
    !selectedCategory || !name.categoria_sugerida_id || name.categoria_sugerida_id === selectedCategory.id
  ) || [];

  const CategoryPicker = () => (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>Seleccionar Categoría</Text>
        <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.pickerList}>
        {categories?.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.pickerItem}
            onPress={() => {
              setSelectedCategory(category);
              setSelectedExpenseName(null); // Reset expense name when category changes
              setShowCategoryPicker(false);
            }}
          >
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={styles.pickerItemText}>{category.nombre}</Text>
            {selectedCategory?.id === category.id && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ExpenseNamePicker = () => (
    <View style={styles.pickerContainer}>
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>Seleccionar Nombre de Gasto</Text>
        <TouchableOpacity onPress={() => setShowExpenseNamePicker(false)}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.pickerList}>
        {filteredExpenseNames.map((expenseName) => (
          <TouchableOpacity
            key={expenseName.id}
            style={styles.pickerItem}
            onPress={() => {
              setSelectedExpenseName(expenseName);
              setShowExpenseNamePicker(false);
            }}
          >
            <Text style={styles.pickerItemText}>{expenseName.nombre}</Text>
            {selectedExpenseName?.id === expenseName.id && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar Gasto</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={createExpenseMutation.isPending}
            style={[styles.saveButton, createExpenseMutation.isPending && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveButtonText, createExpenseMutation.isPending && styles.saveButtonTextDisabled]}>
              {createExpenseMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Amount Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Monto *</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              autoFocus
            />
          </View>

          {/* Date Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Fecha *</Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Category Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Categoría *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
              disabled={categoriesLoading}
            >
              {selectedCategory ? (
                <View style={styles.selectedItemContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: selectedCategory.color }]} />
                  <Text style={styles.selectedItemText}>{selectedCategory.nombre}</Text>
                </View>
              ) : (
                <Text style={styles.pickerButtonText}>
                  {categoriesLoading ? 'Cargando...' : 'Seleccionar categoría'}
                </Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Expense Name Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre del Gasto *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowExpenseNamePicker(true)}
              disabled={expenseNamesLoading || !selectedCategory}
            >
              {selectedExpenseName ? (
                <Text style={styles.selectedItemText}>{selectedExpenseName.nombre}</Text>
              ) : (
                <Text style={styles.pickerButtonText}>
                  {expenseNamesLoading ? 'Cargando...' : 
                   !selectedCategory ? 'Primero selecciona una categoría' :
                   'Seleccionar nombre de gasto'}
                </Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción adicional..."
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <CategoryPicker />
        </Modal>

        {/* Expense Name Picker Modal */}
        <Modal
          visible={showExpenseNamePicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowExpenseNamePicker(false)}
        >
          <ExpenseNamePicker />
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  saveButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.surface,
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },

  // Form
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  fieldContainer: {
    marginTop: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedItemText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },

  // Picker Modal
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerItemText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
});