/**
 * Tarjeta de paciente — Diseño BitCare
 * Avatar con iniciales, info limpia, ícono PNG médico
 * Sin referencia a QR Code
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
            <Text style={styles.detailValue}>
              {patient.sexo === 'M' ? 'Masculino' : 'Femenino'}
            </Text>
          </View>
        </View>
        <View style={styles.diagRow}>
          <Image
            source={require('../assets/icons/cardiograma.png')}
            style={styles.diagIcon}
            resizeMode="contain"
          />
          <Text style={styles.diagnosis} numberOfLines={1}>
            {patient.diagnostico_medico}
          </Text>
        </View>
        {patient.alergias.length > 0 && (
          <View style={styles.allergiesRow}>
            <Text style={styles.allergyIcon}>⚠</Text>
            <Text style={styles.allergies}>{patient.alergias.join(', ')}</Text>
          </View>
        )}
      </View>
      <View style={styles.arrowWrap}>
        <Text style={styles.arrow}>›</Text>
      </View>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  initials: {
    fontSize: FontSize.lg,
    color: Colors.text,
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
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  diagIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.textSecondary,
  },
  diagnosis: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  allergiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  allergyIcon: {
    fontSize: 12,
    color: Colors.warning,
  },
  allergies: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  arrow: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginTop: -2,
  },
});
