/**
 * Pantalla de Historial de Valoraciones
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

export default function HistoryScreen() {
  const { assessments, patients } = useAssessment();

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.nombre || 'Paciente desconocido';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? Colors.success : Colors.warning;
  };

  return (
    <View style={styles.container}>
      {assessments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(item.date).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status === 'completed' ? '✓ Completada' : '⏳ En progreso'}
                  </Text>
                </View>
              </View>
              <Text style={styles.patientName}>
                {getPatientName(item.patientId)}
              </Text>
              <View style={styles.patternsRow}>
                {Object.keys(item.patterns).map((p) => (
                  <View key={p} style={styles.patternChip}>
                    <Text style={styles.patternChipText}>{p}</Text>
                  </View>
                ))}
              </View>
              {item.suggestions.length > 0 && (
                <View style={styles.suggestionsRow}>
                  <Text style={styles.suggestionsLabel}>
                    {item.suggestions.length} diagnóstico(s) sugerido(s)
                  </Text>
                </View>
              )}
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>
                  {item.synced ? '☁️ Sincronizado' : '📱 Solo local'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  patientName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  patternsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  patternChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  patternChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  suggestionsRow: {
    backgroundColor: Colors.warningBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  suggestionsLabel: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  syncRow: {
    alignItems: 'flex-end',
  },
  syncText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
