/**
 * Pantalla de Pacientes — Diseño BitCare
 * Directorio de pacientes con búsqueda
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';



export default function PatientsScreen() {
  const { patients, loadPatients, selectPatient, startAssessment, isLoading } = useAssessment();
  const [searchQuery, setSearchQuery] = useState('');

  // Carga inicial
  useEffect(() => {
    loadPatients();
  }, []);

  // Recarga automática cada vez que la tab recibe foco
  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [])
  );

  // Buscar en API con debounce simple
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(searchQuery || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnostico_medico.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePatientPress = (patient: typeof patients[0]) => {
    selectPatient(patient);
    startAssessment(patient.id);
    router.push(`/assessment/${patient.id}`);
  };



  const renderPatient = ({ item }: { item: typeof patients[0] }) => {
    const initials = item.nombre
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');

    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => handlePatientPress(item)}
        activeOpacity={0.7}
      >
        {/* Botón editar */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/patients/${item.id}/edit`)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.nombre}</Text>
          <Text style={styles.patientMeta}>
            Edad:{item.edad} años · Sexo: {item.sexo === 'M' ? 'Masculino' : 'Femenino'}
          </Text>

          {/* Diagnóstico */}
          <View style={styles.diagRow}>
            <Image
              source={require('../../assets/icons/cardiograma.png')}
              style={styles.diagIcon}
              resizeMode="contain"
            />
            <Text style={styles.diagText} numberOfLines={1}>
              {item.diagnostico_medico}
            </Text>
          </View>

          {/* Alergias */}
          {item.alergias.length > 0 && (
            <View style={styles.alergiaRow}>
              <Text style={styles.alergiaWarning}>⚠</Text>
              <Text style={styles.alergiaText} numberOfLines={1}>
                {item.alergias.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Directorio de Pacientes</Text>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() => router.push('/patients/new')}
          activeOpacity={0.8}
        >
          <Text style={styles.headerAddIcon}>+</Text>
        </TouchableOpacity>
      </View>



      {/* Búsqueda */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Busqueda"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <Text style={styles.counter}>{filteredPatients.length} pacientes encontrados</Text>

      {/* Lista en grid de 2 columnas */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => loadPatients()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            {isLoading ? (
              <Text style={styles.emptyText}>Cargando pacientes...</Text>
            ) : (
              <>
                <Text style={styles.emptyText}>Sin pacientes registrados</Text>
                <Text style={styles.emptySubtext}>¡Registra el primero!</Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => router.push('/patients/new')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyAddBtnText}>+ Registrar Paciente</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      {/* FAB — botón flotante para agregar paciente */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/patients/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddIcon: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 26,
  },

  // Búsqueda
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  counter: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  // Lista
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  // Tarjeta de paciente
  patientCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
    minHeight: 160,
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  editIcon: {
    fontSize: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 3,
  },
  patientMeta: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  diagIcon: {
    width: 14,
    height: 14,
    flexShrink: 0,
  },
  diagText: {
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
  },
  alergiaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  alergiaWarning: {
    fontSize: 10,
    color: Colors.warning,
  },
  alergiaText: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
    opacity: 0.3,
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
    marginBottom: Spacing.xl,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyAddBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  fabIcon: {
    fontSize: 30,
    color: Colors.white,
    fontWeight: '200',
    lineHeight: 34,
  },
});
