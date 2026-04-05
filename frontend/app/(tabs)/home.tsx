/**
 * Pantalla de Inicio (Home/Dashboard)
 * Muestra acciones rápidas y resumen del día
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';
import { PATTERNS, FUTURE_PATTERNS } from '../../constants/patterns';

export default function HomeScreen() {
  const { user } = useAuth();
  const { patients, assessments, loadMockPatients } = useAssessment();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMockPatients();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedToday = assessments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header de bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            Hola, {user?.nombre?.split(' ')[0] || 'Enfermero'} 👋
          </Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Stats rápidas */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primaryDark + '20' }]}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successDark + '20' }]}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{completedToday}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.secondaryDark + '20' }]}>
            <Text style={[styles.statNumber, { color: Colors.secondary }]}>{assessments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.actionPrimary]}
            onPress={() => router.push('/scanner')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionTitle}>Escanear QR</Text>
            <Text style={styles.actionDesc}>Abrir expediente por código</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/patients')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>Pacientes</Text>
            <Text style={styles.actionDesc}>Ver lista completa</Text>
          </TouchableOpacity>
        </View>

        {/* Patrones disponibles */}
        <Text style={styles.sectionTitle}>Patrones de Gordon • MVP</Text>
        <View style={styles.patternsContainer}>
          {PATTERNS.map((pattern) => (
            <View
              key={pattern.id}
              style={[styles.patternCard, { borderLeftColor: pattern.color }]}
            >
              <View style={styles.patternHeader}>
                <Text style={styles.patternIcon}>{pattern.icon}</Text>
                <View style={styles.patternInfo}>
                  <Text style={styles.patternName}>{pattern.name}</Text>
                  <Text style={styles.patternDesc}>{pattern.description}</Text>
                </View>
                <View style={[styles.mvpBadge, { backgroundColor: Colors.successBg }]}>
                  <Text style={[styles.mvpBadgeText, { color: Colors.success }]}>MVP</Text>
                </View>
              </View>
              <Text style={styles.patternFieldCount}>
                {pattern.fields.length} campos • {pattern.fields.filter((f) => f.isSeedQuestion).length} preguntas semilla
              </Text>
            </View>
          ))}
        </View>

        {/* Patrones futuros */}
        <Text style={styles.sectionTitle}>Próximamente</Text>
        <View style={styles.futureGrid}>
          {FUTURE_PATTERNS.map((p) => (
            <View key={p.id} style={styles.futureCard}>
              <Text style={styles.futureIcon}>{p.icon}</Text>
              <Text style={styles.futureName} numberOfLines={2}>{p.name}</Text>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>🔒</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
  },
  welcomeSection: {
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: '800',
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize.xxxl,
    color: Colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  actionPrimary: {
    backgroundColor: Colors.primaryDark + '30',
    borderColor: Colors.primaryDark,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  patternsContainer: {
    marginBottom: Spacing.xxl,
  },
  patternCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  patternInfo: {
    flex: 1,
  },
  patternName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
  },
  patternDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mvpBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  mvpBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  patternFieldCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  futureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  futureCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  futureIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  futureName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  lockedBadge: {
    marginTop: Spacing.xs,
  },
  lockedText: {
    fontSize: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});
