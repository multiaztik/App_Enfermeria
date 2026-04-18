/**
 * Pantalla de Registro de Paciente — BitCare
 * Formulario completo para crear un nuevo paciente en MongoDB
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { patientsApi } from '../../utils/api';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

/* ─── Tipos ────────────────────────────────────────────────────────────── */
type Sexo = 'M' | 'F';

interface FormState {
  nombre: string;
  edad: string;
  sexo: Sexo;
  peso: string;
  talla: string;
  diagnostico_medico: string;
  alergias: string[];
  alergiaInput: string;
  qr_code: string;
}

const INITIAL_FORM: FormState = {
  nombre: '',
  edad: '',
  sexo: 'M',
  peso: '',
  talla: '',
  diagnostico_medico: '',
  alergias: [],
  alergiaInput: '',
  qr_code: '',
};

/* ─── Componente Principal ─────────────────────────────────────────────── */
export default function NewPatientScreen() {
  const { loadPatients } = useAssessment();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    // Generar QR automático
    setForm((f) => ({
      ...f,
      qr_code: `PAC-${Date.now().toString(36).toUpperCase()}`,
    }));
  }, []);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /* ── Alergias ── */
  const addAlergia = () => {
    const tag = form.alergiaInput.trim();
    if (!tag) return;
    if (form.alergias.includes(tag)) {
      setForm((f) => ({ ...f, alergiaInput: '' }));
      return;
    }
    setForm((f) => ({ ...f, alergias: [...f.alergias, tag], alergiaInput: '' }));
  };

  const removeAlergia = (tag: string) => {
    setForm((f) => ({ ...f, alergias: f.alergias.filter((a) => a !== tag) }));
  };

  /* ── Validación ── */
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (!form.edad || isNaN(Number(form.edad)) || Number(form.edad) < 0)
      newErrors.edad = 'Edad inválida';
    if (!form.diagnostico_medico.trim())
      newErrors.diagnostico_medico = 'Diagnóstico requerido';
    if (form.peso && isNaN(Number(form.peso)))
      newErrors.peso = 'Peso inválido';
    if (form.talla && isNaN(Number(form.talla)))
      newErrors.talla = 'Talla inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Guardar ── */
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await patientsApi.create({
        qr_code: form.qr_code,
        personal_data: {
          nombre: form.nombre.trim(),
          edad: Number(form.edad),
          sexo: form.sexo,
          peso: form.peso ? Number(form.peso) : undefined,
          talla: form.talla ? Number(form.talla) : undefined,
          alergias: form.alergias,
          diagnostico_medico: form.diagnostico_medico.trim(),
        },
      });

      await loadPatients();

      Alert.alert(
        'Éxito',
        `${form.nombre.trim()} fue añadido correctamente.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Paciente</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* QR Badge */}
        <View style={styles.qrBadge}>
          <Text style={styles.qrLabel}>ID del Paciente</Text>
          <Text style={styles.qrValue}>{form.qr_code}</Text>
          <Text style={styles.qrHint}>Generado automáticamente</Text>
        </View>

        {/* ── Datos Personales ── */}
        <SectionTitle>Datos Personales</SectionTitle>

        <FieldGroup label="Nombre completo *" error={errors.nombre}>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            placeholder="Ej: Juan Pérez García"
            placeholderTextColor={Colors.textMuted}
            value={form.nombre}
            onChangeText={(v) => update('nombre', v)}
            autoCapitalize="words"
          />
        </FieldGroup>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FieldGroup label="Edad *" error={errors.edad}>
              <TextInput
                style={[styles.input, errors.edad && styles.inputError]}
                placeholder="45"
                placeholderTextColor={Colors.textMuted}
                value={form.edad}
                onChangeText={(v) => update('edad', v)}
                keyboardType="numeric"
              />
            </FieldGroup>
          </View>
          <View style={styles.rowItem}>
            <FieldGroup label="Sexo">
              <View style={styles.sexoRow}>
                {(['M', 'F'] as Sexo[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sexoBtn, form.sexo === s && styles.sexoBtnActive]}
                    onPress={() => setForm((f) => ({ ...f, sexo: s }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sexoBtnText, form.sexo === s && styles.sexoBtnTextActive]}>
                      {s === 'M' ? '♂ Masc.' : '♀ Fem.'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FieldGroup>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FieldGroup label="Peso (kg)" error={errors.peso}>
              <TextInput
                style={[styles.input, errors.peso && styles.inputError]}
                placeholder="72.5"
                placeholderTextColor={Colors.textMuted}
                value={form.peso}
                onChangeText={(v) => update('peso', v)}
                keyboardType="decimal-pad"
              />
            </FieldGroup>
          </View>
          <View style={styles.rowItem}>
            <FieldGroup label="Talla (m)" error={errors.talla}>
              <TextInput
                style={[styles.input, errors.talla && styles.inputError]}
                placeholder="1.68"
                placeholderTextColor={Colors.textMuted}
                value={form.talla}
                onChangeText={(v) => update('talla', v)}
                keyboardType="decimal-pad"
              />
            </FieldGroup>
          </View>
        </View>

        {/* ── Información Clínica ── */}
        <SectionTitle>Información Clínica</SectionTitle>

        <FieldGroup label="Diagnóstico médico *" error={errors.diagnostico_medico}>
          <TextInput
            style={[styles.inputMulti, errors.diagnostico_medico && styles.inputError]}
            placeholder="Ej: Diabetes Mellitus Tipo 2"
            placeholderTextColor={Colors.textMuted}
            value={form.diagnostico_medico}
            onChangeText={(v) => update('diagnostico_medico', v)}
            multiline
            numberOfLines={2}
          />
        </FieldGroup>

        {/* ── Alergias ── */}
        <FieldGroup label="Alergias conocidas">
          <View style={styles.alergiaInputRow}>
            <TextInput
              style={styles.alergiaTextInput}
              placeholder="Ej: Penicilina"
              placeholderTextColor={Colors.textMuted}
              value={form.alergiaInput}
              onChangeText={(v) => setForm((f) => ({ ...f, alergiaInput: v }))}
              onSubmitEditing={addAlergia}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.alergiaAddBtn} onPress={addAlergia}>
              <Text style={styles.alergiaAddIcon}>+</Text>
            </TouchableOpacity>
          </View>
          {form.alergias.length > 0 && (
            <View style={styles.alergiaChips}>
              {form.alergias.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.chip}
                  onPress={() => removeAlergia(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{tag}</Text>
                  <Text style={styles.chipX}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {form.alergias.length === 0 && (
            <Text style={styles.alergiaHint}>Toca + para agregar • Toca el chip para eliminar</Text>
          )}
        </FieldGroup>

        {/* ── Botón Guardar ── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Registrar Paciente</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ─── Sub-componentes ──────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

/* ─── Estilos ──────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 52,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSpacer: {
    width: 36,
  },

  /* Scroll */
  scrollContent: {
    padding: Spacing.lg,
  },

  /* QR badge */
  qrBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    ...Shadows.medium,
  },
  qrLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  qrValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },

  /* Section */
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },

  /* Row layout */
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowItem: {
    flex: 1,
  },

  /* Fields */
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldError: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: 4,
  },

  /* Input */
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 48,
  },
  inputMulti: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerBg,
  },

  /* Sexo */
  sexoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sexoBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  sexoBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sexoBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sexoBtnTextActive: {
    color: Colors.textInverse,
  },

  /* Alergias */
  alergiaInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  alergiaTextInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  alergiaAddBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alergiaAddIcon: {
    fontSize: 24,
    color: Colors.textInverse,
    fontWeight: '300',
    lineHeight: 28,
  },
  alergiaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dangerBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: '600',
  },
  chipX: {
    fontSize: FontSize.md,
    color: Colors.danger,
    lineHeight: 18,
  },
  alergiaHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  /* Save button */
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xxl,
    ...Shadows.medium,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
});
