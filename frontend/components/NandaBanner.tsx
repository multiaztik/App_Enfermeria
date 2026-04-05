/**
 * Banner de sugerencia de diagnóstico NANDA
 * Se muestra en tiempo real cuando el motor detecta un diagnóstico
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../constants/colors';
import type { NandaDiagnosis } from '../utils/nandaRules';

interface NandaBannerProps {
  diagnosis: NandaDiagnosis;
  index?: number;
}

const PRIORITY_CONFIG = {
  high: {
    color: Colors.danger,
    bg: Colors.dangerBg,
    label: 'ALTA',
    icon: '🔴',
  },
  medium: {
    color: Colors.warning,
    bg: Colors.warningBg,
    label: 'MEDIA',
    icon: '🟡',
  },
  low: {
    color: Colors.info,
    bg: Colors.infoBg,
    label: 'BAJA',
    icon: '🔵',
  },
};

export function NandaBanner({ diagnosis, index = 0 }: NandaBannerProps) {
  const slideAnim = useRef(new Animated.Value(50)).current;
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
          backgroundColor: config.bg,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={[styles.code, { color: config.color }]}>
            NANDA {diagnosis.code}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: config.color + '30' }]}>
            <Text style={[styles.priorityText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.diagnosis}>{diagnosis.nameEs}</Text>
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
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
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
  icon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  code: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
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
  },
  evidenceTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
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
