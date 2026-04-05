/**
 * Input numérico con estilo clínico
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

interface NumberInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onValueChange,
  unit,
  placeholder,
  required,
}: NumberInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onValueChange}
          placeholder={placeholder || '0'}
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        {unit && (
          <View style={styles.unitContainer}>
            <Text style={styles.unit}>{unit}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: Colors.danger,
    marginLeft: 4,
    fontSize: FontSize.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  unitContainer: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
