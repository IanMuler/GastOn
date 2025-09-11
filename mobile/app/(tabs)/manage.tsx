// Pantalla Manage - Gestión de categorías y nombres de gastos
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing, componentSpacing } from '@/styles/spacing';
import { CATEGORIES_MOCK, EXPENSE_NAMES_MOCK } from '@/utils/mockData';
import { Category, ExpenseName } from '@/types/api';

type TabType = 'nombres' | 'categorias';
type ModalType = 'category' | 'expenseName' | 'delete' | null;

const MANAGE_TABS = [
  { id: 'nombres' as TabType, label: 'Nombres' },
  { id: 'categorias' as TabType, label: 'Categorías' },
];

const CATEGORY_COLORS = [
  '#0d80f2', // Blue
  '#22c55e', // Green  
  '#f59e0b', // Yellow/Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
];

export default function ManageScreen() {
  /* States */
  const [activeTab, setActiveTab] = useState<TabType>('nombres');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<Category | ExpenseName | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | ExpenseName | null>(null);
  
  // Mock states (in real app, these would come from TanStack Query)
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_MOCK);
  const [expenseNames, setExpenseNames] = useState<ExpenseName[]>(EXPENSE_NAMES_MOCK);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ nombre: '', color: CATEGORY_COLORS[0] });
  const [expenseNameForm, setExpenseNameForm] = useState({ nombre: '', categoria_sugerida_id: categories[0]?.id ?? 1 });

  /* Handlers */
  const handleAddCategory = () => {
    setCategoryForm({ nombre: '', color: CATEGORY_COLORS[0] });
    setEditingItem(null);
    setModalType('category');
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({ nombre: category.nombre, color: category.color });
    setEditingItem(category);
    setModalType('category');
  };

  const handleAddExpenseName = () => {
    setExpenseNameForm({ nombre: '', categoria_sugerida_id: categories[0]?.id ?? 1 });
    setEditingItem(null);
    setModalType('expenseName');
  };

  const handleEditExpenseName = (expenseName: ExpenseName) => {
    setExpenseNameForm({ 
      nombre: expenseName.nombre, 
      categoria_sugerida_id: expenseName.categoria_sugerida_id ?? 1
    });
    setEditingItem(expenseName);
    setModalType('expenseName');
  };

  const handleDelete = (item: Category | ExpenseName) => {
    setDeleteItem(item);
    setModalType('delete');
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    if ('color' in deleteItem) {
      // Deleting category
      setCategories(prev => prev.filter(c => c.id !== deleteItem.id));
    } else {
      // Deleting expense name
      setExpenseNames(prev => prev.filter(e => e.id !== deleteItem.id));
    }

    setModalType(null);
    setDeleteItem(null);
  };

  const saveCategoryForm = () => {
    if (!categoryForm.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return;
    }

    const categoryData = {
      nombre: categoryForm.nombre.trim(),
      color: categoryForm.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingItem && 'color' in editingItem) {
      // Editing existing category
      setCategories(prev => prev.map(c => 
        c.id === editingItem.id ? { ...c, ...categoryData } : c
      ));
    } else {
      // Adding new category
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        ...categoryData,
      };
      setCategories(prev => [...prev, newCategory]);
    }

    setModalType(null);
    setCategoryForm({ nombre: '', color: CATEGORY_COLORS[0] });
  };

  const saveExpenseNameForm = () => {
    if (!expenseNameForm.nombre.trim()) {
      Alert.alert('Error', 'El nombre del gasto es requerido');
      return;
    }

    const expenseNameData = {
      nombre: expenseNameForm.nombre.trim(),
      categoria_sugerida_id: expenseNameForm.categoria_sugerida_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingItem && !('color' in editingItem)) {
      // Editing existing expense name
      setExpenseNames(prev => prev.map(e => 
        e.id === editingItem.id ? { ...e, ...expenseNameData } : e
      ));
    } else {
      // Adding new expense name
      const newExpenseName: ExpenseName = {
        id: Math.max(...expenseNames.map(e => e.id)) + 1,
        ...expenseNameData,
      };
      setExpenseNames(prev => [...prev, newExpenseName]);
    }

    setModalType(null);
    setExpenseNameForm({ nombre: '', categoria_sugerida_id: categories[0]?.id ?? 1 });
  };

  /* Sub-components */
  const TabButton = ({ tab, isActive }: { tab: { id: TabType; label: string }; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab.id)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryItem = ({ category }: { category: Category }) => (
    <View style={styles.listItem}>
      <View style={styles.itemContent}>
        <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
        <Text style={styles.itemTitle}>{category.nombre}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditCategory(category)}
        >
          <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(category)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ExpenseNameItem = ({ expenseName }: { expenseName: ExpenseName }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{expenseName.nombre}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditExpenseName(expenseName)}
          >
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(expenseName)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const groupExpenseNamesByCategory = () => {
    return categories.map(category => ({
      category,
      expenseNames: expenseNames.filter(e => e.categoria_sugerida_id === category.id),
    })).filter(group => group.expenseNames.length > 0);
  };

  const EmptyState = ({ message, onAdd }: { message: string; onAdd: () => void }) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{message}</Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onAdd}>
        <Text style={styles.emptyStateButtonText}>Agregar Nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {MANAGE_TABS.map((tab) => (
          <TabButton 
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'categorias' ? (
          categories.length > 0 ? (
            categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))
          ) : (
            <EmptyState message="No hay categorías" onAdd={handleAddCategory} />
          )
        ) : (
          // Nombres tab - grouped by category
          groupExpenseNamesByCategory().length > 0 ? (
            groupExpenseNamesByCategory().map((group) => (
              <View key={group.category.id}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: group.category.color }]} />
                  <Text style={styles.sectionTitle}>{group.category.nombre}</Text>
                </View>
                {group.expenseNames.map((expenseName) => (
                  <ExpenseNameItem key={expenseName.id} expenseName={expenseName} />
                ))}
              </View>
            ))
          ) : (
            <EmptyState message="No hay nombres de gastos" onAdd={handleAddExpenseName} />
          )
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={activeTab === 'categorias' ? handleAddCategory : handleAddExpenseName}
      >
        <Ionicons name="add" size={24} color={colors.background} />
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal visible={modalType === 'category'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre</Text>
              <TextInput
                style={styles.formInput}
                value={categoryForm.nombre}
                onChangeText={(text) => setCategoryForm(prev => ({ ...prev, nombre: text }))}
                placeholder="Nombre de la categoría"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      categoryForm.color === color && styles.colorSelected
                    ]}
                    onPress={() => setCategoryForm(prev => ({ ...prev, color }))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalType(null)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={saveCategoryForm}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {editingItem ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expense Name Modal */}
      <Modal visible={modalType === 'expenseName'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Nombre' : 'Nuevo Nombre'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre</Text>
              <TextInput
                style={styles.formInput}
                value={expenseNameForm.nombre}
                onChangeText={(text) => setExpenseNameForm(prev => ({ ...prev, nombre: text }))}
                placeholder="Nombre del gasto"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría Sugerida</Text>
              <View style={styles.categorySelector}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelectorOption,
                      expenseNameForm.categoria_sugerida_id === category.id && styles.categorySelectorSelected
                    ]}
                    onPress={() => setExpenseNameForm(prev => ({ ...prev, categoria_sugerida_id: category.id }))}
                  >
                    <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                    <Text style={[
                      styles.categorySelectorText,
                      expenseNameForm.categoria_sugerida_id === category.id && styles.categorySelectorTextSelected
                    ]}>
                      {category.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalType(null)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={saveExpenseNameForm}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {editingItem ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={modalType === 'delete'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.deleteMessage}>
              ¿Estás seguro que quieres eliminar "{deleteItem?.nombre}"?
              {deleteItem && 'color' in deleteItem && (
                <Text style={styles.deleteWarning}>
                  {'\n\n'}Esto también eliminará todos los nombres de gastos relacionados.
                </Text>
              )}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalType(null)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextPrimary}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  content: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 72,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  itemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
  },
  addButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.text,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: colors.textSecondary,
  },
  categorySelector: {
    gap: spacing.xs,
  },
  categorySelectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  categorySelectorSelected: {
    backgroundColor: colors.primaryLight,
  },
  categorySelectorText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  categorySelectorTextSelected: {
    fontWeight: typography.weights.medium,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.text,
  },
  modalButtonSecondary: {
    backgroundColor: colors.surface,
  },
  modalButtonDanger: {
    backgroundColor: '#ef4444',
  },
  modalButtonTextPrimary: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  modalButtonTextSecondary: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  deleteMessage: {
    fontSize: typography.sizes.base,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  deleteWarning: {
    fontSize: typography.sizes.sm,
    color: '#ef4444',
    fontWeight: typography.weights.medium,
  },
});