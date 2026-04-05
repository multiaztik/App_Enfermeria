/**
 * Tarjeta de paciente con información resumida
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../constants/colors';
import type { Patient } from '../contexts/AssessmentContext';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const initials = patient.nombre
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{patient.nombre}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Edad</Text>
            <Text style={styles.detailValue}>{patient.edad} años</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Sexo</Text>
            <Text style={styles.detailValue}>{patient.sexo === 'M' ? 'Masculino' : 'Femenino'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>QR</Text>
            <Text style={styles.detailValue}>{patient.qr_code}</Text>
          </View>
        </View>
        <Text style={styles.diagnosis} numberOfLines={1}>
          📋 {patient.diagnostico_medico}
        </Text>
        {patient.alergias.length > 0 && (
          <View style={styles.allergiesRow}>
            <Text style={styles.allergyIcon}>⚠️</Text>
            <Text style={styles.allergies}>
              {patient.alergias.join(', ')}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryDark + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  initials: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  diagnosis: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  allergiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  allergyIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  allergies: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
});
