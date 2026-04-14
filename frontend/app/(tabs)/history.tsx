/**
 * Pantalla de Historial de Valoraciones — Diseño BitCare
 * Lista limpia con tarjetas blancas, header con ícono
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

const PATTERN_LABELS: Record<string, { name: string; icon: any }> = {
  nutritional: {
    name: 'Nutricional-Metabólico',
    icon: require('../../assets/icons/estomago.png'),
  },
  sleep: {
    name: 'Sueño-Descanso',
    icon: require('../../assets/icons/cerebro.png'),
  },
  stress: {
    name: 'Tolerancia al Estrés',
    icon: require('../../assets/icons/cardiograma.png'),
  },
};

export default function HistoryScreen() {
  const { assessments, patients } = useAssessment();

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.nombre || 'Paciente desconocido';
  };

  const getStatusConfig = (status: string) => {
    if (status === 'completed') {
      return { color: Colors.success, label: 'Completada', icon: '✓' };
    }
    return { color: Colors.warning, label: 'En progreso', icon: '⏳' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
            const status = getStatusConfig(item.status);
            const initials = getPatientName(item.patientId)
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('');

            return (
              <View style={styles.card}>
                {/* Header de tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{initials}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.patientName}>
                      {getPatientName(item.patientId)}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(item.date).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.icon} {status.label}
                    </Text>
                  </View>
                </View>

                {/* Patrones evaluados */}
                <View style={styles.patternsRow}>
                  {Object.keys(item.patterns).map((p) => {
                    const patternInfo = PATTERN_LABELS[p];
                    return (
                      <View key={p} style={styles.patternChip}>
                        {patternInfo?.icon && (
                          <Image
                            source={patternInfo.icon}
                            style={styles.patternChipIcon}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={styles.patternChipText}>
                          {patternInfo?.name || p}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Diagnósticos */}
                {item.suggestions.length > 0 && (
                  <View style={styles.diagRow}>
                    <View style={styles.diagBadge}>
                      <Text style={styles.diagBadgeText}>
                        {item.suggestions.length} diagnóstico(s) sugerido(s)
                      </Text>
                    </View>
                  </View>
                )}

                {/* Sync */}
                <View style={styles.syncRow}>
                  <Text style={styles.syncText}>
                    {item.synced ? '☁️ Sincronizado' : '📱 Solo local'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.text,
    opacity: 0.4,
  },
  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyImg: {
    width: 64,
    height: 64,
    tintColor: Colors.textMuted,
    opacity: 0.3,
    marginBottom: Spacing.lg,
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
  // List
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardAvatarText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  cardInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  // Patterns
  patternsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  patternChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  patternChipIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.textSecondary,
  },
  patternChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Diagnostics
  diagRow: {
    marginBottom: Spacing.sm,
  },
  diagBadge: {
    backgroundColor: Colors.warningBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  diagBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  // Sync
  syncRow: {
    alignItems: 'flex-end',
  },
  syncText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
