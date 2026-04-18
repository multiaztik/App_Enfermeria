/**
 * Banner de sugerencia de diagnóstico NANDA — Diseño BitCare
 * Tarjeta blanca con borde izquierdo de color según prioridad
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../constants/colors';
import type { NandaDiagnosis } from '../utils/nandaRules';

interface NandaBannerProps {
  diagnosis: NandaDiagnosis;
  index?: number;
}

const PRIORITY_CONFIG = {
  high: {
    color: Colors.danger,
    label: 'ALTA',
    dot: '●',
  },
  medium: {
    color: Colors.warning,
    label: 'MEDIA',
    dot: '●',
  },
  low: {
    color: Colors.info,
    label: 'BAJA',
    dot: '●',
  },
};

export function NandaBanner({ diagnosis, index = 0 }: NandaBannerProps) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const config = PRIORITY_CONFIG[diagnosis.priority];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim, index]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderLeftColor: config.color,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.dot, { color: config.color }]}>{config.dot}</Text>
          <Text style={styles.code}>NANDA {diagnosis.code}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: config.color + '18' }]}>
            <Text style={[styles.priorityText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Diagnóstico */}
      <Text style={styles.diagnosis}>{diagnosis.nameEs}</Text>

      {/* Evidencia */}
      <View style={styles.evidenceContainer}>
        <Text style={styles.evidenceTitle}>Evidencia:</Text>
        {diagnosis.evidence.map((e, i) => (
          <View key={i} style={styles.evidenceRow}>
            <Text style={styles.evidenceBullet}>•</Text>
            <Text style={styles.evidenceText}>{e}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 10,
    marginRight: Spacing.xs,
  },
  code: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  priorityText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  diagnosis: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  evidenceContainer: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  evidenceTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  evidenceBullet: {
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
    fontSize: FontSize.sm,
  },
  evidenceText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
});
