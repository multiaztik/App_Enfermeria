/**
 * Pantalla de Resultados de Valoración
 * Muestra el resumen con diagnósticos NANDA detectados
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { NandaBanner } from '../../components/NandaBanner';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

export default function ResultsScreen() {
  const { currentPatient, currentAssessment, suggestions } = useAssessment();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const highPriority = suggestions.filter((s) => s.priority === 'high');
  const mediumPriority = suggestions.filter((s) => s.priority === 'medium');
  const lowPriority = suggestions.filter((s) => s.priority === 'low');
  const completedPatterns = Object.keys(currentAssessment?.patterns || {});

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Valoración Completada</Text>
          <Text style={styles.successSubtitle}>
            {currentPatient?.nombre}
          </Text>
          <Text style={styles.successDate}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedPatterns.length}</Text>
            <Text style={styles.statLabel}>Patrones{'\n'}evaluados</Text>
          </View>
          <View style={[styles.statCard, styles.statDanger]}>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>{highPriority.length}</Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}alta</Text>
          </View>
          <View style={[styles.statCard, styles.statWarning]}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>{mediumPriority.length}</Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}media</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.info }]}>{lowPriority.length}</Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}baja</Text>
          </View>
        </View>

        {/* Diagnósticos detectados */}
        {suggestions.length > 0 ? (
          <View style={styles.diagnosisSection}>
            <Text style={styles.sectionTitle}>
              🩺 Diagnósticos NANDA-I Sugeridos
            </Text>
            <Text style={styles.sectionSubtitle}>
              Basados en los hallazgos clínicos detectados durante la valoración
            </Text>

            {suggestions.map((s, i) => (
              <NandaBanner key={`${s.code}-${i}`} diagnosis={s} index={i} />
            ))}
          </View>
        ) : (
          <View style={styles.noDiagnosisCard}>
            <Text style={styles.noDiagnosisIcon}>✨</Text>
            <Text style={styles.noDiagnosisText}>
              No se detectaron diagnósticos NANDA
            </Text>
            <Text style={styles.noDiagnosisSubtext}>
              Los patrones evaluados no presentan alteraciones significativas
            </Text>
          </View>
        )}

        {/* Patrones evaluados */}
        <Text style={styles.sectionTitle}>📋 Patrones Evaluados</Text>
        {completedPatterns.map((p) => (
          <View key={p} style={styles.patternSummaryCard}>
            <View style={styles.patternSummaryHeader}>
              <Text style={styles.patternSummaryIcon}>
                {p === 'nutritional' ? '🍎' : p === 'sleep' ? '🌙' : '🧠'}
              </Text>
              <Text style={styles.patternSummaryName}>
                {p === 'nutritional'
                  ? 'Nutricional-Metabólico'
                  : p === 'sleep'
                  ? 'Sueño-Descanso'
                  : 'Tolerancia al Estrés'}
              </Text>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓</Text>
              </View>
            </View>
            <Text style={styles.fieldCount}>
              {Object.keys(currentAssessment?.patterns[p] || {}).length} campos registrados
            </Text>
          </View>
        ))}

        {/* Acciones */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.replace('/(tabs)/home')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionText}>🏠 Ir al Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.replace('/(tabs)/patients')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionText}>
              👥 Nueva Valoración
            </Text>
          </TouchableOpacity>
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
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.successBg,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.successDark + '30',
  },
  successIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    color: Colors.success,
    fontWeight: '800',
  },
  successSubtitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  successDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statDanger: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerDark + '20',
  },
  statWarning: {
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warningDark + '20',
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  diagnosisSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  noDiagnosisCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noDiagnosisIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  noDiagnosisText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  noDiagnosisSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  patternSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patternSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternSummaryIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  patternSummaryName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.sm,
  },
  fieldCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginLeft: 36,
  },
  actionsContainer: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  primaryActionText: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  secondaryAction: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryActionText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
