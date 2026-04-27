/**
 * Pantalla de Historial de Valoraciones — BitCare
 * Tarjetas clickeables → abre modal con diagnósticos NANDA detallados
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';
import type { NandaDiagnosis } from '../../utils/nandaRules';
import type { Assessment } from '../../contexts/AssessmentContext';

const PATTERN_LABELS: Record<string, { name: string; icon: any }> = {
  nutritional: { name: 'Nutricional-Metabólico', icon: require('../../assets/icons/estomago.png') },
  sleep: { name: 'Sueño-Descanso', icon: require('../../assets/icons/cerebro.png') },
  stress: { name: 'Tolerancia al Estrés', icon: require('../../assets/icons/cardiograma.png') },
  perception: { name: 'Percepción-Manejo de Salud', icon: require('../../assets/icons/ojo.png') },
  elimination: { name: 'Eliminación', icon: require('../../assets/icons/donacion-de-sangre.png') },
  activity: { name: 'Actividad-Ejercicio', icon: require('../../assets/icons/pecho.png') },
  cognitive: { name: 'Cognitivo-Perceptual', icon: require('../../assets/icons/cerebro.png') },
  self_perception: { name: 'Autopercepción', icon: require('../../assets/icons/enfermera.png') },
  role: { name: 'Rol-Relaciones', icon: require('../../assets/icons/doctor.png') },
  sexuality: { name: 'Sexualidad', icon: require('../../assets/icons/utero.png') },
  values: { name: 'Valores-Creencias', icon: require('../../assets/icons/historial-medico.png') },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: Colors.danger,
  medium: Colors.warning,
  low: Colors.success,
};
const PRIORITY_LABEL: Record<string, string> = {
  high: 'Alta', medium: 'Media', low: 'Baja',
};

export default function HistoryScreen() {
  const { assessments, patients, loadAssessments, loadPatients } = useAssessment();
  const [selected, setSelected] = useState<Assessment | null>(null);

  // Recarga automática cada vez que la tab recibe foco
  useFocusEffect(
    useCallback(() => {
      loadAssessments();
      loadPatients();
    }, [])
  );

  const getName = (id: string) =>
    patients.find((p) => p.id === id)?.nombre || 'Paciente desconocido';

  const getStatus = (status: string) =>
    status === 'completed'
      ? { color: Colors.success, label: 'Completada', icon: '✓' }
      : { color: Colors.warning, label: 'En progreso', icon: '⏳' };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSubtitle}>
            {assessments.length} valoración(es) registrada(s)
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/portapapeles.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>

      {assessments.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={require('../../assets/icons/portapapeles.png')}
            style={styles.emptyImg}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>Sin valoraciones</Text>
          <Text style={styles.emptySubtitle}>
            Las valoraciones completadas aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = getStatus(item.status);
            const initials = getName(item.patientId)
              .split(' ').map((n) => n[0]).slice(0, 2).join('');
            const diags = item.suggestions as NandaDiagnosis[];

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => setSelected(item)}
              >
                {/* Header tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{initials}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.patientName}>{getName(item.patientId)}</Text>
                    <Text style={styles.cardDate}>
                      {formatDate(item.date)} · {formatTime(item.date)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.icon} {status.label}
                    </Text>
                  </View>
                </View>

                {/* Chips de patrones evaluados */}
                <View style={styles.patternsRow}>
                  {Object.keys(item.patterns).map((p) => {
                    const info = PATTERN_LABELS[p];
                    return (
                      <View key={p} style={styles.patternChip}>
                        {info?.icon && (
                          <Image source={info.icon} style={styles.patternChipIcon} resizeMode="contain" />
                        )}
                        <Text style={styles.patternChipText}>{info?.name || p}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Diagnósticos — preview */}
                {diags.length > 0 ? (
                  <View style={styles.diagPreview}>
                    <Text style={styles.diagPreviewText}>
                      🩺 {diags.length} diagnóstico(s) NANDA — Toca para ver detalles
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noDiagText}>Sin diagnósticos detectados</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ─── MODAL DE DETALLE ──────────────────────────────────────────── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            {/* Título */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {selected ? getName(selected.patientId) : ''}
                </Text>
                <Text style={styles.sheetDate}>
                  {selected ? `${formatDate(selected.date)} · ${formatTime(selected.date)}` : ''}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {/* Diagnósticos NANDA */}
              {selected && (selected.suggestions as NandaDiagnosis[]).length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>
                    🩺 Diagnósticos NANDA-I Sugeridos ({(selected.suggestions as NandaDiagnosis[]).length})
                  </Text>
                  {(selected.suggestions as NandaDiagnosis[]).map((d, i) => {
                    const priorityColor = PRIORITY_COLOR[d.priority] || Colors.textSecondary;
                    return (
                      <View key={`${d.code}-${i}`} style={[styles.diagCard, { borderLeftColor: priorityColor }]}>
                        <View style={styles.diagCardHeader}>
                          <Text style={styles.diagCode}>{d.code}</Text>
                          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                            <Text style={[styles.priorityText, { color: priorityColor }]}>
                              {PRIORITY_LABEL[d.priority] || d.priority}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.diagLabel}>{d.nameEs}</Text>
                        {d.evidence && d.evidence.length > 0 && (
                          <View style={styles.diagFactors}>
                            <Text style={styles.diagFactorsTitle}>Evidencia clínica:</Text>
                            {d.evidence.map((f: string, fi: number) => (
                              <Text key={fi} style={styles.diagFactor}>• {f}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              ) : (
                <View style={styles.emptyDiag}>
                  <Text style={styles.emptyDiagText}>No se detectaron diagnósticos NANDA en esta valoración.</Text>
                </View>
              )}

              {/* Patrones evaluados */}
              {selected && Object.keys(selected.patterns).length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
                    📋 Patrones evaluados ({Object.keys(selected.patterns).length})
                  </Text>
                  {Object.keys(selected.patterns).map((p) => {
                    const info = PATTERN_LABELS[p];
                    const fields = selected.patterns[p];
                    const count = Object.keys(fields).length;
                    return (
                      <View key={p} style={styles.patternDetail}>
                        <View style={styles.patternDetailHeader}>
                          {info?.icon && (
                            <Image source={info.icon} style={styles.patternDetailIcon} resizeMode="contain" />
                          )}
                          <Text style={styles.patternDetailName}>{info?.name || p}</Text>
                          <Text style={styles.patternDetailCount}>{count} campo(s)</Text>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  headerIcon: { width: 28, height: 28, tintColor: Colors.text, opacity: 0.4 },
  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyImg: { width: 64, height: 64, tintColor: Colors.textMuted, opacity: 0.3, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.xl, color: Colors.text, fontWeight: '700' },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  // List
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  // Card
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.small,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  cardAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  cardAvatarText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  cardInfo: { flex: 1 },
  patientName: { fontSize: FontSize.md, color: Colors.text, fontWeight: '700' },
  cardDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  // Patterns chips
  patternsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  patternChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: BorderRadius.full, gap: 4,
  },
  patternChipIcon: { width: 14, height: 14, tintColor: Colors.textSecondary },
  patternChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  // Diag preview
  diagPreview: {
    backgroundColor: Colors.warningBg, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  diagPreviewText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: '600' },
  noDiagText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  // Modal / Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '88%',
    paddingTop: Spacing.md,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  sheetDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  closeBtnText: { fontSize: FontSize.md, color: Colors.text, fontWeight: '700' },
  sheetScroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.text,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  // Diagnóstico cards
  diagCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.border,
  },
  diagCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  diagCode: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.5 },
  priorityBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  priorityText: { fontSize: FontSize.xs, fontWeight: '700' },
  diagLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  diagFactors: { marginTop: Spacing.xs },
  diagFactorsTitle: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  diagFactor: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  emptyDiag: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyDiagText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
  // Pattern detail
  patternDetail: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  patternDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  patternDetailIcon: { width: 18, height: 18, tintColor: Colors.textSecondary },
  patternDetailName: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  patternDetailCount: { fontSize: FontSize.xs, color: Colors.textMuted },
});
