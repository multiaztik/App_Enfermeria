/**
 * Pantalla de Inicio (Home) — Diseño BitCare
 * Header con "Hola Enfermer@", stats, y tarjetas de patrones con descripción
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';
import { FUTURE_PATTERNS } from '../../constants/patterns';

// Definición rica de los 3 patrones MVP con descripción, campos y ícono
const MVP_PATTERNS = [
  {
    id: 'nutritional',
    name: 'Nutricional-Metabólico',
    icon: require('../../assets/icons/estomago.png'),
    descripcion: 'Evalúa el estado nutricional, metabólico e integridad de la piel.',
    evalua: ['Peso / Talla / IMC', 'Apetito y deglución', 'Mucosa oral y piel', 'Glucosa y albúmina'],
  },
  {
    id: 'sleep',
    name: 'Sueño-Descanso',
    icon: require('../../assets/icons/cerebro.png'),
    descripcion: 'Evalúa la calidad y cantidad del sueño y el descanso del paciente.',
    evalua: ['Horas de sueño', 'Calidad / tipo de insomnio', 'Medicación para dormir', 'Fatiga diurna'],
  },
  {
    id: 'stress',
    name: 'Tolerancia al Estrés',
    icon: require('../../assets/icons/cardiograma.png'),
    descripcion: 'Evalúa los niveles de estrés, mecanismos de afrontamiento y apoyo.',
    evalua: ['Nivel de estrés', 'Estrategia de afrontamiento', 'Signos de ansiedad', 'Red de apoyo'],
  },
];

// Íconos para patrones futuros
const FUTURE_ICONS: Record<string, any> = {
  perception: require('../../assets/icons/ojo.png'),
  activity: require('../../assets/icons/pecho.png'),
  cognitive: require('../../assets/icons/cerebro.png'),
  self_perception: require('../../assets/icons/enfermera.png'),
  role: require('../../assets/icons/doctor.png'),
  sexuality: require('../../assets/icons/utero.png'),
  values: require('../../assets/icons/historial-medico.png'),
  health_management: require('../../assets/icons/pildora.png'),
  elimination: require('../../assets/icons/donacion-de-sangre.png'),
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { patients, assessments, loadMockPatients } = useAssessment();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMockPatients();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const completedToday = assessments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header — Hola Enfermer@ con enfermera + doctor */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hola Enfermer@</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerIcons}>
            <Image
              source={require('../../assets/icons/enfermera.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/icons/doctor.png')}
              style={[styles.headerIcon, { opacity: 0.5 }]}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statNumber, styles.statNumberLight]}>{completedToday}</Text>
            <Text style={[styles.statLabel, styles.statLabelLight]}>Hoy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{assessments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Patrones MVP — con descripción y qué evalúan */}
        <Text style={styles.sectionTitle}>Patrones de Gordon • MVP</Text>
        <View style={styles.patternsContainer}>
          {MVP_PATTERNS.map((pattern, idx) => (
            <TouchableOpacity
              key={pattern.id}
              style={[styles.patternCard, idx < MVP_PATTERNS.length - 1 && styles.patternCardBorder]}
              onPress={() => router.push('/(tabs)/patients')}
              activeOpacity={0.7}
            >
              {/* Ícono y nombre */}
              <View style={styles.patternHeader}>
                <View style={styles.patternIconWrap}>
                  <Image source={pattern.icon} style={styles.patternImg} resizeMode="contain" />
                </View>
                <View style={styles.patternTitleWrap}>
                  <Text style={styles.patternName}>{pattern.name}</Text>
                  <Text style={styles.patternDesc}>{pattern.descripcion}</Text>
                </View>
                <View style={styles.patternChevronWrap}>
                  <Text style={styles.patternChevron}>›</Text>
                </View>
              </View>

              {/* Lo que evalúa */}
              <View style={styles.evalua}>
                {pattern.evalua.map((item, i) => (
                  <View key={i} style={styles.evaluaItem}>
                    <View style={styles.evaluaDot} />
                    <Text style={styles.evaluaText}>{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Acceso rápido a pacientes */}
        <TouchableOpacity
          style={styles.patientsButton}
          onPress={() => router.push('/(tabs)/patients')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/icons/historial-medico.png')}
            style={styles.patientsButtonIcon}
            resizeMode="contain"
          />
          <Text style={styles.patientsButtonText}>Ver Directorio de Pacientes</Text>
          <Text style={styles.patientsButtonArrow}>›</Text>
        </TouchableOpacity>

        {/* Próximamente */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>Próximamente</Text>
        <View style={styles.futureGrid}>
          {FUTURE_PATTERNS.map((p) => {
            const iconSrc = FUTURE_ICONS[p.id];
            return (
              <View key={p.id} style={styles.futureCard}>
                {iconSrc ? (
                  <Image source={iconSrc} style={styles.futureImg} resizeMode="contain" />
                ) : (
                  <Text style={styles.futureEmoji}>{p.icon}</Text>
                )}
                <Text style={styles.futureName} numberOfLines={2}>{p.name}</Text>
                <Text style={styles.futureLock}>🔒</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: Spacing.md,
    alignItems: 'center',
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  statCardDark: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  statNumberLight: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statLabelLight: {
    color: 'rgba(255,255,255,0.7)',
  },
  // Section titles
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  // Patrones — cards expandidas
  patternsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  patternCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.surface,
  },
  patternCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  patternIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  patternImg: {
    width: 26,
    height: 26,
  },
  patternTitleWrap: {
    flex: 1,
  },
  patternName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  patternDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  patternChevronWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    flexShrink: 0,
  },
  patternChevron: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginTop: -2,
  },
  // Lo que evalúa — puntos bajo cada patrón
  evalua: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginLeft: 56, // alinea con el texto del título
  },
  evaluaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evaluaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textMuted,
  },
  evaluaText: {
    fontSize: FontSize.xs - 1,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  // Botón pacientes
  patientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.medium,
  },
  patientsButtonIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.white,
    marginRight: Spacing.md,
  },
  patientsButtonText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  patientsButtonArrow: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
  },
  // Future
  futureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  futureCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  futureImg: {
    width: 28,
    height: 28,
    marginBottom: Spacing.xs,
  },
  futureEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  futureName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  futureLock: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  bottomSpacer: {
    height: 20,
  },
});
