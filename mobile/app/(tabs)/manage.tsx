// Pantalla Manage (placeholder por ahora)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing } from '@/styles/spacing';

export default function ManageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage</Text>
      <Text style={styles.subtitle}>Gestión de categorías y nombres</Text>
      <Text style={styles.placeholder}>Esta pantalla se implementará próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.headerTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.itemTitle,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  placeholder: {
    ...textStyles.itemSubtitle,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});