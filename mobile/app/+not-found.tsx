// Pantalla 404 básica
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/styles/colors';
import { typography, textStyles } from '@/styles/typography';
import { spacing } from '@/styles/spacing';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esta pantalla no existe.</Text>
      <Link href="/(tabs)" style={styles.link}>
        <Text style={styles.linkText}>Volver al inicio</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  linkText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});