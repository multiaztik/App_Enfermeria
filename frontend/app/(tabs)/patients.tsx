/**
 * Pantalla de Pacientes
 * Lista de pacientes con búsqueda y acceso a valoración
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { PatientCard } from '../../components/PatientCard';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

export default function PatientsScreen() {
  const { patients, loadMockPatients, selectPatient, startAssessment } = useAssessment();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (patients.length === 0) {
      loadMockPatients();
    }
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnostico_medico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientPress = (patient: typeof patients[0]) => {
    selectPatient(patient);
    startAssessment(patient.id);
    router.push(`/assessment/${patient.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, QR o diagnóstico..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <Text style={styles.scanButtonText}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <View style={styles.counterRow}>
        <Text style={styles.counter}>{filteredPatients.length} pacientes</Text>
        {searchQuery && (
          <Text style={styles.filterLabel}>Filtrado: "{searchQuery}"</Text>
        )}
      </View>

      {/* Lista de pacientes */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onPress={() => handlePatientPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No se encontraron pacientes</Text>
            <Text style={styles.emptySubtext}>
              Intenta con otro término de búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  clearSearch: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    padding: Spacing.xs,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  scanButtonText: {
    fontSize: 20,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  counter: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
