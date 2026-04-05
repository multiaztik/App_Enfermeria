/**
 * Pantalla principal de Valoración Clínica
 * Flujo de evaluación por patrones con acordeón y lógica condicional
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Accordion } from '../../components/ui/Accordion';
import { Toggle } from '../../components/ui/Toggle';
import { Selector } from '../../components/ui/Selector';
import { SliderInput } from '../../components/ui/SliderInput';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { NumberInput } from '../../components/ui/NumberInput';
import { NandaBanner } from '../../components/NandaBanner';
import { PATTERNS } from '../../constants/patterns';
import { getBMICategory } from '../../utils/nandaRules';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';
import type { PatternField } from '../../constants/patterns';

export default function AssessmentScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const {
    currentPatient,
    currentAssessment,
    updatePattern,
    completeAssessment,
    suggestions,
  } = useAssessment();

  // Estado local para cada patrón
  const [patternData, setPatternData] = useState<Record<string, Record<string, unknown>>>({});

  const getFieldValue = (patternId: string, fieldId: string): unknown => {
    return patternData[patternId]?.[fieldId];
  };

  const setFieldValue = useCallback(
    (patternId: string, fieldId: string, value: unknown) => {
      setPatternData((prev) => {
        const updated = {
          ...prev,
          [patternId]: {
            ...(prev[patternId] || {}),
            [fieldId]: value,
          },
        };
        // Actualizar el contexto para recalcular NANDA
        updatePattern(patternId, updated[patternId]);
        return updated;
      });
    },
    [updatePattern]
  );

  const shouldShowField = (patternId: string, field: PatternField): boolean => {
    if (!field.showWhen) return true;
    const parentValue = getFieldValue(patternId, field.showWhen.fieldId);
    return parentValue === field.showWhen.value;
  };

  const handleComplete = async () => {
    Alert.alert(
      'Completar Valoración',
      `¿Deseas finalizar la valoración de ${currentPatient?.nombre}?\n\nSe detectaron ${suggestions.length} diagnóstico(s) sugerido(s).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            await completeAssessment();
            router.push('/assessment/results');
          },
        },
      ]
    );
  };

  if (!currentPatient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Paciente no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calcular BMI si hay datos
  const weight = patternData.nutritional?.weight as number;
  const height = patternData.nutritional?.height as number;
  const bmiInfo = weight && height ? getBMICategory(weight, height) : null;

  const renderField = (patternId: string, field: PatternField) => {
    if (!shouldShowField(patternId, field)) return null;

    const value = getFieldValue(patternId, field.id);

    switch (field.type) {
      case 'toggle':
        return (
          <Toggle
            key={field.id}
            label={field.label}
            value={(value as boolean) || false}
            onValueChange={(v) => setFieldValue(patternId, field.id, v)}
          />
        );
      case 'select':
        return (
          <Selector
            key={field.id}
            label={field.label}
            options={field.options || []}
            value={(value as string) || null}
            onValueChange={(v) => setFieldValue(patternId, field.id, v)}
            required={field.required}
          />
        );
      case 'slider':
        return (
          <SliderInput
            key={field.id}
            label={field.label}
            value={(value as number) || field.min || 0}
            onValueChange={(v) => setFieldValue(patternId, field.id, v)}
            min={field.min || 0}
            max={field.max || 10}
            step={field.step || 1}
            unit={field.unit}
          />
        );
      case 'multiselect':
        return (
          <MultiSelect
            key={field.id}
            label={field.label}
            options={field.options || []}
            values={(value as string[]) || []}
            onValuesChange={(v) => setFieldValue(patternId, field.id, v)}
          />
        );
      case 'number':
        return (
          <NumberInput
            key={field.id}
            label={field.label}
            value={value !== undefined && value !== '' ? String(value) : ''}
            onValueChange={(v) => {
              if (v === '' || v === undefined) {
                setFieldValue(patternId, field.id, '');
                return;
              }
              // Store as number if valid, keep string for intermediate input like "1."
              const num = parseFloat(v);
              if (!isNaN(num) && !v.endsWith('.')) {
                setFieldValue(patternId, field.id, num);
              } else {
                // Store intermediate string but don't trigger NANDA evaluation
                setPatternData((prev) => ({
                  ...prev,
                  [patternId]: {
                    ...(prev[patternId] || {}),
                    [field.id]: v,
                  },
                }));
              }
            }}
            unit={field.unit}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'text':
        return (
          <View key={field.id} style={styles.textInputContainer}>
            <Text style={styles.textInputLabel}>{field.label}</Text>
            <TextInput
              style={styles.textInput}
              value={(value as string) || ''}
              onChangeText={(v) => setFieldValue(patternId, field.id, v)}
              placeholder={field.placeholder || 'Escribir...'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        );
      case 'body_map':
        return (
          <View key={field.id} style={styles.bodyMapPlaceholder}>
            <Text style={styles.bodyMapIcon}>🫀</Text>
            <Text style={styles.bodyMapText}>Mapa Corporal Interactivo</Text>
            <Text style={styles.bodyMapSubtext}>
              (Toca para localizar: {field.label})
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header del paciente */}
      <View style={styles.patientHeader}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientInitials}>
            {currentPatient.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{currentPatient.nombre}</Text>
          <Text style={styles.patientDetails}>
            {currentPatient.edad} años • {currentPatient.sexo === 'M' ? 'Masculino' : 'Femenino'} • {currentPatient.qr_code}
          </Text>
          <Text style={styles.patientDiagnosis}>📋 {currentPatient.diagnostico_medico}</Text>
        </View>
      </View>

      {/* Alertas del paciente */}
      {currentPatient.alergias.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View>
            <Text style={styles.alertTitle}>Alergias Conocidas</Text>
            <Text style={styles.alertText}>{currentPatient.alergias.join(', ')}</Text>
          </View>
        </View>
      )}

      {/* BMI Indicator */}
      {bmiInfo && (
        <View style={[styles.bmiCard, { borderLeftColor: bmiInfo.color }]}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiLabel}>Índice de Masa Corporal</Text>
            <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>
              {bmiInfo.bmi.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
            {bmiInfo.category}
          </Text>
          {/* BMI Bar */}
          <View style={styles.bmiBar}>
            <View style={[styles.bmiBarSection, { flex: 18.5, backgroundColor: Colors.warning + '60' }]} />
            <View style={[styles.bmiBarSection, { flex: 6.5, backgroundColor: Colors.success + '60' }]} />
            <View style={[styles.bmiBarSection, { flex: 5, backgroundColor: Colors.warning + '60' }]} />
            <View style={[styles.bmiBarSection, { flex: 10, backgroundColor: Colors.danger + '60' }]} />
          </View>
          <View style={styles.bmiLabels}>
            <Text style={styles.bmiLabelText}>Bajo</Text>
            <Text style={styles.bmiLabelText}>Normal</Text>
            <Text style={styles.bmiLabelText}>Sobre</Text>
            <Text style={styles.bmiLabelText}>Obesidad</Text>
          </View>
        </View>
      )}

      {/* Patrones con Acordeón */}
      <Text style={styles.sectionTitle}>Patrones de Valoración</Text>

      {PATTERNS.filter((p) => p.isMvp).map((pattern, idx) => {
        const filledFields = Object.keys(patternData[pattern.id] || {}).length;
        const totalFields = pattern.fields.filter((f) => !f.showWhen).length;
        const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

        return (
          <Accordion
            key={pattern.id}
            title={pattern.name}
            icon={pattern.icon}
            color={pattern.color}
            badge={progress > 0 ? `${Math.min(progress, 100)}%` : undefined}
            badgeColor={progress >= 80 ? Colors.success : Colors.primary}
            defaultOpen={idx === 0}
          >
            {pattern.fields.map((field) => renderField(pattern.id, field))}
          </Accordion>
        );
      })}

      {/* Sugerencias NANDA en tiempo real */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>
            🩺 Diagnósticos NANDA Sugeridos ({suggestions.length})
          </Text>
          {suggestions.map((s, i) => (
            <NandaBanner key={`${s.code}-${i}`} diagnosis={s} index={i} />
          ))}
        </View>
      )}

      {/* Botón de completar */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>
          ✓ Completar Valoración
        </Text>
        {suggestions.length > 0 && (
          <Text style={styles.completeSubtext}>
            {suggestions.length} diagnóstico(s) detectado(s)
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  patientHeader: {
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
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  patientInitials: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: '700',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  patientDetails: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  patientDiagnosis: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dangerDark + '30',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  alertTitle: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: '700',
  },
  alertText: {
    fontSize: FontSize.sm,
    color: Colors.dangerLight,
    marginTop: 2,
  },
  bmiCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bmiValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  bmiCategory: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  bmiBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: Spacing.md,
    gap: 2,
  },
  bmiBarSection: {
    borderRadius: 3,
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  bmiLabelText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  suggestionsSection: {
    marginTop: Spacing.lg,
  },
  completeButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.xxl,
    ...Shadows.medium,
  },
  completeButtonText: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: '800',
  },
  completeSubtext: {
    fontSize: FontSize.xs,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  textInputContainer: {
    marginBottom: Spacing.md,
  },
  textInputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyMapPlaceholder: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  bodyMapIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  bodyMapText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  bodyMapSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  bottomSpacer: {
    height: 40,
  },
});
