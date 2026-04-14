/**
 * StepperInput — BitCare
 * Control numérico con botones −/+ para seleccionar valores enteros o con paso exacto.
 * Reemplaza al slider que saltaba varias unidades en un toque.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

interface StepperInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function StepperInput({
  label,
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  unit,
}: StepperInputProps) {
  const dec = () => {
    const next = Math.round((value - step) * 100) / 100;
    if (next >= min) onValueChange(next);
  };

  const inc = () => {
    const next = Math.round((value + step) * 100) / 100;
    if (next <= max) onValueChange(next);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {unit && <Text style={styles.unitHint}>{unit}</Text>}
      </View>

      <View style={styles.controls}>
        {/* Botón − */}
        <TouchableOpacity
          style={[styles.btn, atMin && styles.btnDisabled]}
          onPress={dec}
          disabled={atMin}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnIcon, atMin && styles.btnIconDisabled]}>−</Text>
        </TouchableOpacity>

        {/* Valor actual */}
        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>

        {/* Botón + */}
        <TouchableOpacity
          style={[styles.btn, atMax && styles.btnDisabled]}
          onPress={inc}
          disabled={atMax}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnIcon, atMax && styles.btnIconDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de progreso visual */}
      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            { width: `${((value - min) / (max - min)) * 100}%` as any },
          ]}
        />
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeLabel}>{min}</Text>
        <Text style={styles.rangeLabel}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  unitHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.border,
  },
  btnIcon: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 28,
  },
  btnIconDisabled: {
    color: Colors.textMuted,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 60,
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 38,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
