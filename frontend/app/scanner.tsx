/**
 * Pantalla de Scanner QR
 * Usa Expo Camera para escanear códigos QR de pacientes
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useAssessment } from '../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../constants/colors';

export default function ScannerScreen() {
  const { findPatientByQR, selectPatient, startAssessment, loadMockPatients, patients } = useAssessment();
  const [manualCode, setManualCode] = useState('');

  // Asegurar que los pacientes estén cargados
  React.useEffect(() => {
    if (patients.length === 0) {
      loadMockPatients();
    }
  }, []);

  const handleQRScanned = (qrCode: string) => {
    const patient = findPatientByQR(qrCode);
    if (patient) {
      selectPatient(patient);
      startAssessment(patient.id);
      router.replace(`/assessment/${patient.id}`);
    } else {
      Alert.alert(
        'Paciente no encontrado',
        `No se encontró un paciente con el código QR: ${qrCode}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      handleQRScanned(manualCode.trim().toUpperCase());
    }
  };

  return (
    <View style={styles.container}>
      {/* Simulación de cámara QR */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraTitle}>Escáner QR</Text>
          <Text style={styles.cameraSubtitle}>
            En un dispositivo real, aquí se mostraría la cámara para escanear el código QR del paciente
          </Text>
        </View>

        {/* Esquinas del scanner */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Línea de escaneo animada */}
        <View style={styles.scanLine} />
      </View>

      {/* Entrada manual */}
      <View style={styles.manualSection}>
        <Text style={styles.manualTitle}>O ingresa el código manualmente</Text>
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Ej: UAZ-2026-001"
            placeholderTextColor={Colors.textMuted}
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleManualEntry}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleManualEntry}
            activeOpacity={0.8}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Códigos de prueba */}
      <View style={styles.testSection}>
        <Text style={styles.testTitle}>🧪 Códigos de prueba (Demo)</Text>
        <View style={styles.testCodes}>
          {['UAZ-2026-001', 'UAZ-2026-002', 'UAZ-2026-003', 'UAZ-2026-004', 'UAZ-2026-005'].map((code) => (
            <TouchableOpacity
              key={code}
              style={styles.testCode}
              onPress={() => handleQRScanned(code)}
              activeOpacity={0.7}
            >
              <Text style={styles.testCodeText}>{code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  cameraContainer: {
    height: 250,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  cameraTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  cameraSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 20,
    left: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 20,
    right: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.6,
    top: '50%',
  },
  manualSection: {
    marginBottom: Spacing.xxl,
  },
  manualTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: 1,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    ...Shadows.small,
  },
  searchButtonText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: '700',
  },
  testSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  testCodes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  testCode: {
    backgroundColor: Colors.primaryDark + '20',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '40',
  },
  testCodeText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
