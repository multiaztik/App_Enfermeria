/**
 * Pantalla de Resultados de Valoración — Diseño BitCare
 * Header con ícono de éxito, stats, diagnósticos NANDA y botones de acción
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { NandaBanner } from '../../components/NandaBanner';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

const PATTERN_INFO: Record<string, { name: string; icon: any }> = {
  nutritional: {
    name: 'Nutricional-Metabólico',
    icon: require('../../assets/icons/estomago.png'),
  },
  sleep: {
    name: 'Sueño-Descanso',
    icon: require('../../assets/icons/cerebro.png'),
  },
  stress: {
    name: 'Tolerancia al Estrés',
    icon: require('../../assets/icons/cardiograma.png'),
  },
};

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
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Valoración Completada</Text>
          <Text style={styles.successSubtitle}>{currentPatient?.nombre}</Text>
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
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statNumber, styles.statNumberLight]}>
              {completedPatterns.length}
            </Text>
            <Text style={[styles.statLabel, styles.statLabelLight]}>
              Patrones{'\n'}evaluados
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>
              {highPriority.length}
            </Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}alta</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>
              {mediumPriority.length}
            </Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}media</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.info }]}>
              {lowPriority.length}
            </Text>
            <Text style={styles.statLabel}>Prioridad{'\n'}baja</Text>
          </View>
        </View>

        {/* Diagnósticos detectados */}
        {suggestions.length > 0 ? (
          <View style={styles.diagnosisSection}>
            <Text style={styles.sectionTitle}>Diagnósticos NANDA-I Sugeridos</Text>
            <Text style={styles.sectionSubtitle}>
              Basados en los hallazgos clínicos detectados durante la valoración
            </Text>
            {suggestions.map((s, i) => (
              <NandaBanner key={`${s.code}-${i}`} diagnosis={s} index={i} />
            ))}
          </View>
        ) : (
          <View style={styles.noDiagnosisCard}>
            <View style={styles.noDiagnosisIconWrap}>
              <Text style={styles.noDiagnosisCheck}>✓</Text>
            </View>
            <Text style={styles.noDiagnosisText}>
              No se detectaron diagnósticos NANDA
            </Text>
            <Text style={styles.noDiagnosisSubtext}>
              Los patrones evaluados no presentan alteraciones significativas
            </Text>
          </View>
        )}

        {/* Patrones evaluados */}
        <Text style={styles.sectionTitle}>Patrones Evaluados</Text>
        {completedPatterns.map((p) => {
          const info = PATTERN_INFO[p];
          return (
            <View key={p} style={styles.patternSummaryCard}>
              <View style={styles.patternSummaryHeader}>
                <View style={styles.patternIconWrap}>
                  {info?.icon ? (
                    <Image
                      source={info.icon}
                      style={styles.patternImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.patternEmoji}>📋</Text>
                  )}
                </View>
                <View style={styles.patternTextWrap}>
                  <Text style={styles.patternSummaryName}>
                    {info?.name || p}
                  </Text>
                  <Text style={styles.fieldCount}>
                    {Object.keys(currentAssessment?.patterns[p] || {}).length} campos registrados
                  </Text>
                </View>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Acciones */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.replace('/(tabs)/home')}
            activeOpacity={0.85}
          >
            <Image
              source={require('../../assets/icons/hospital.png')}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.primaryActionText}>Ir al Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.replace('/(tabs)/patients')}
            activeOpacity={0.85}
          >
            <Image
              source={require('../../assets/icons/enfermera.png')}
              style={[styles.actionIcon, styles.actionIconDark]}
              resizeMode="contain"
            />
            <Text style={styles.secondaryActionText}>Nueva Valoración</Text>
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
  // Success
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successCheckmark: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '800',
  },
  successTitle: {
    fontSize: FontSize.xxl,
    color: Colors.text,
    fontWeight: '800',
  },
  successSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  successDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  // Stats
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
  statCardDark: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  statNumberLight: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  statLabelLight: {
    color: 'rgba(255,255,255,0.7)',
  },
  // Diagnosis
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
    ...Shadows.small,
  },
  noDiagnosisIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  noDiagnosisCheck: {
    fontSize: 28,
    color: Colors.success,
    fontWeight: '800',
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
  // Patterns
  patternSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  patternSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  patternImg: {
    width: 24,
    height: 24,
    tintColor: Colors.text,
  },
  patternEmoji: {
    fontSize: 20,
  },
  patternTextWrap: {
    flex: 1,
  },
  patternSummaryName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  fieldCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.sm,
  },
  // Actions
  actionsContainer: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg + 2,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
  },
  actionIconDark: {
    tintColor: Colors.text,
  },
  primaryActionText: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg + 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
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
