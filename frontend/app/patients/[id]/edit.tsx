/**
 * Pantalla de Edición de Paciente — BitCare
 * Edita datos de un paciente existente en MongoDB
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { patientsApi } from '../../../utils/api';
import { useAssessment } from '../../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../../constants/colors';

type Sexo = 'M' | 'F';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadPatients } = useAssessment();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<Sexo>('M');
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [alergiaInput, setAlergiaInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    patientsApi.getById(id).then((p) => {
      setNombre(p.personal_data.nombre);
      setEdad(String(p.personal_data.edad));
      setSexo(p.personal_data.sexo as Sexo);
      setPeso(p.personal_data.peso ? String(p.personal_data.peso) : '');
      setTalla(p.personal_data.talla ? String(p.personal_data.talla) : '');
      setDiagnostico(p.personal_data.diagnostico_medico);
      setAlergias(p.personal_data.alergias);
    }).catch(() => Alert.alert('Error', 'No se pudo cargar el paciente'))
      .finally(() => setLoading(false));
  }, [id]);

  const addAlergia = () => {
    const tag = alergiaInput.trim();
    if (!tag || alergias.includes(tag)) { setAlergiaInput(''); return; }
    setAlergias([...alergias, tag]);
    setAlergiaInput('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'Requerido';
    if (!edad || isNaN(Number(edad))) e.edad = 'Inválida';
    if (!diagnostico.trim()) e.diagnostico = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await patientsApi.update(id!, {
        personal_data: {
          nombre: nombre.trim(),
          edad: Number(edad),
          sexo,
          peso: peso ? Number(peso) : undefined,
          talla: talla ? Number(talla) : undefined,
          alergias,
          diagnostico_medico: diagnostico.trim(),
        },
      });
      await loadPatients();
      Alert.alert('Éxito', 'Paciente actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await patientsApi.delete(id!);
      await loadPatients();
      setShowDelete(false);
      router.replace('/(tabs)/patients');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al eliminar');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Paciente</Text>
        <TouchableOpacity style={styles.deleteHeaderBtn} onPress={() => setShowDelete(true)}>
          <Text style={styles.deleteHeaderIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Nombre */}
        <Field label="Nombre completo *" error={errors.nombre}>
          <TextInput style={[styles.input, errors.nombre && styles.inputErr]}
            value={nombre} onChangeText={setNombre} autoCapitalize="words" />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Edad *" error={errors.edad}>
              <TextInput style={[styles.input, errors.edad && styles.inputErr]}
                value={edad} onChangeText={setEdad} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Sexo">
              <View style={styles.sexoRow}>
                {(['M', 'F'] as Sexo[]).map((s) => (
                  <TouchableOpacity key={s}
                    style={[styles.sexoBtn, sexo === s && styles.sexoBtnOn]}
                    onPress={() => setSexo(s)}>
                    <Text style={[styles.sexoBtnTxt, sexo === s && styles.sexoBtnTxtOn]}>
                      {s === 'M' ? '♂ Masc.' : '♀ Fem.'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Peso (kg)">
              <TextInput style={styles.input} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholder="72.5" placeholderTextColor={Colors.textMuted} />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Talla (m)">
              <TextInput style={styles.input} value={talla} onChangeText={setTalla} keyboardType="decimal-pad" placeholder="1.68" placeholderTextColor={Colors.textMuted} />
            </Field>
          </View>
        </View>

        <Field label="Diagnóstico médico *" error={errors.diagnostico}>
          <TextInput style={[styles.inputMulti, errors.diagnostico && styles.inputErr]}
            value={diagnostico} onChangeText={setDiagnostico} multiline numberOfLines={2} />
        </Field>

        <Field label="Alergias">
          <View style={styles.alRow}>
            <TextInput style={styles.alInput} value={alergiaInput}
              onChangeText={setAlergiaInput} onSubmitEditing={addAlergia}
              placeholder="Ej: Penicilina" placeholderTextColor={Colors.textMuted} returnKeyType="done" />
            <TouchableOpacity style={styles.alAddBtn} onPress={addAlergia}>
              <Text style={styles.alAddIcon}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chips}>
            {alergias.map((tag) => (
              <TouchableOpacity key={tag} style={styles.chip} onPress={() => setAlergias(alergias.filter(a => a !== tag))}>
                <Text style={styles.chipTxt}>{tag}</Text>
                <Text style={styles.chipX}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnTxt}>Guardar Cambios</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal eliminar */}
      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>¿Eliminar paciente?</Text>
            <Text style={styles.confirmMsg}>Esta acción no se puede deshacer.</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDelete(false)}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.deleteTxt}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldErr}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, ...Shadows.small,
  },
  backBtn: { width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.text, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  deleteHeaderBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  deleteHeaderIcon: { fontSize: 20 },
  content: { padding: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  field: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  fieldErr: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 3 },
  input: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text, minHeight: 48 },
  inputMulti: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text, minHeight: 70, textAlignVertical: 'top' },
  inputErr: { borderColor: Colors.danger },
  sexoRow: { flexDirection: 'row', gap: Spacing.xs },
  sexoBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center' },
  sexoBtnOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sexoBtnTxt: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  sexoBtnTxtOn: { color: Colors.white },
  alRow: { flexDirection: 'row', gap: Spacing.sm },
  alInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  alAddBtn: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  alAddIcon: { fontSize: 24, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.dangerBg, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 5, borderWidth: 1, borderColor: Colors.danger + '30' },
  chipTxt: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '600' },
  chipX: { fontSize: FontSize.md, color: Colors.danger, lineHeight: 18 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl, ...Shadows.medium },
  saveBtnTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  confirmCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xxl, padding: Spacing.xxl, width: '100%', maxWidth: 360, alignItems: 'center' },
  confirmTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  confirmMsg: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  confirmBtns: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  deleteBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.danger, alignItems: 'center' },
  deleteTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
