/**
 * Pantalla de Perfil del Enfermero — BitCare
 * Avatar con ícono PNG, info card, aviso de privacidad, consentimiento, logout, eliminar cuenta
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showConsent, setShowConsent] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      setShowDeleteAccount(false);
      router.replace('/login');
    } catch {
      setDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Image
            source={require('../../assets/icons/doctor.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </View>

        {/* Avatar y nombre */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Image
              source={require('../../assets/icons/enfermera.png')}
              style={styles.avatarImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.name}>{user?.nombre || 'Usuario'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'nurse' ? 'Enfermero/a' : 'Estudiante'}
            </Text>
          </View>
        </View>

        {/* Información */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Image
                source={require('../../assets/icons/app-medica.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Usuario</Text>
              <Text style={styles.infoValue}>{user?.username || '-'}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Image
                source={require('../../assets/icons/historial-medico.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Cédula Profesional</Text>
              <Text style={styles.infoValue}>{user?.cedula || '-'}</Text>
            </View>
          </View>
        </View>

        {/* ─── ACUERDOS LEGALES ─── */}
        <View style={styles.legalSection}>
          <Text style={styles.legalSectionTitle}>📋 Acuerdos Legales</Text>

          {/* Badge de consentimiento */}
          <View style={[
            styles.consentBadge,
            { backgroundColor: user?.consentimiento_legal ? Colors.success + '15' : Colors.warning + '15' }
          ]}>
            <Text style={[
              styles.consentBadgeTitle,
              { color: user?.consentimiento_legal ? Colors.success : Colors.warning }
            ]}>
              {user?.consentimiento_legal ? '✓ Consentimiento otorgado' : '⚠ Sin consentimiento registrado'}
            </Text>
            <Text style={styles.consentBadgeSub}>
              {user?.consentimiento_legal
                ? 'Aceptado al momento del registro'
                : 'El consentimiento no fue registrado en este perfil'}
            </Text>
          </View>

          {/* Aviso de Privacidad */}
          <TouchableOpacity
            style={styles.legalCard}
            onPress={() => setShowPrivacy(!showPrivacy)}
            activeOpacity={0.75}
          >
            <View style={styles.legalRow}>
              <Text style={styles.legalCardIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.legalCardTitle}>Aviso de Privacidad</Text>
                <Text style={styles.legalCardSub}>Versión corregida</Text>
              </View>
              <Text style={styles.legalChevron}>{showPrivacy ? '▲' : '▼'}</Text>
            </View>
            {showPrivacy && (
              <View style={styles.legalBody}>
                <Text style={styles.legalBodyText}>
                  <Text style={styles.legalBold}>Responsable: </Text>
                  {'El presente proyecto es desarrollado de forma independiente con fines académicos por el autor de la aplicación BitCare. No representa a ninguna institución ni organización de salud.\n\n'}
                  <Text style={styles.legalBold}>Datos recabados: </Text>
                  {'La aplicación puede almacenar información como nombre de usuario, identificadores internos y datos clínicos ingresados manualmente durante la valoración.\n\n'}
                  <Text style={styles.legalBold}>Finalidad del tratamiento: </Text>
                  {'Los datos se utilizan exclusivamente para:\n• Pruebas de funcionamiento de la aplicación\n• Simulación de procesos de valoración de enfermería\n• Evaluación de usabilidad con fines académicos\n\n'}
                  <Text style={styles.legalBold}>Almacenamiento de la información: </Text>
                  {'Toda la información se almacena únicamente en el dispositivo del usuario mediante una base de datos local. La aplicación no transmite, comparte ni sincroniza datos con servidores externos.\n\n'}
                  <Text style={styles.legalBold}>Privacidad por diseño: </Text>
                  {'La aplicación está diseñada para operar sin conexión a internet, reduciendo riesgos asociados a la transferencia de datos.\n\n'}
                  <Text style={styles.legalBold}>Responsabilidad del usuario: </Text>
                  {'El usuario es responsable del uso de la aplicación y de la información que decida ingresar. Se recomienda no introducir datos personales reales o sensibles en entornos de prueba.'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Consentimiento de Participación */}
          <TouchableOpacity
            style={styles.legalCard}
            onPress={() => setShowConsent(!showConsent)}
            activeOpacity={0.75}
          >
            <View style={styles.legalRow}>
              <Text style={styles.legalCardIcon}>📄</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.legalCardTitle}>Consentimiento de Participación</Text>
                <Text style={styles.legalCardSub}>Versión fuerte y protegida</Text>
              </View>
              <Text style={styles.legalChevron}>{showConsent ? '▲' : '▼'}</Text>
            </View>
            {showConsent && (
              <View style={styles.legalBody}>
                <Text style={styles.legalBodyText}>
                  <Text style={styles.legalBold}>Consentimiento de Uso y Participación{'\n\n'}</Text>
                  {'Declaro que utilizo la aplicación BitCare de manera voluntaria con fines académicos y de prueba.\n\n'}
                  <Text style={styles.legalBold}>Entiendo y acepto que:{'\n'}</Text>
                  {'• La aplicación es un prototipo en desarrollo y no sustituye el juicio clínico profesional.\n'}
                  {'• Los resultados y sugerencias generados por el sistema son únicamente de carácter orientativo.\n'}
                  {'• La información ingresada es almacenada localmente en el dispositivo y no es monitoreada por terceros.\n'}
                  {'• Soy responsable del uso que haga de la aplicación y de los datos que decida registrar.\n'}
                  {'• No debo utilizar la aplicación para la gestión de pacientes reales en entornos clínicos oficiales.\n'}
                  {'• El uso de la aplicación se realiza bajo mi propio criterio y riesgo.\n\n'}
                  <Text style={styles.legalBold}>Asimismo, acepto que:{'\n'}</Text>
                  {'• Puedo dejar de utilizar la aplicación en cualquier momento.\n'}
                  {'• No existe relación contractual, médica ni institucional derivada del uso de esta herramienta.'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowConfirm(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Botón Eliminar Cuenta */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={() => setShowDeleteAccount(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.deleteAccountText}>🗑 Eliminar Cuenta</Text>
          <Text style={styles.deleteAccountSub}>Se borrarán todos tus datos permanentemente</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BitCare v1.0.0 • Patrones de Gordon</Text>
        <View style={{ height: 30 }} />

        {/* Modal de confirmación logout */}
        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Cerrar Sesión</Text>
              <Text style={styles.confirmMsg}>¿Estás seguro de que deseas salir?</Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowConfirm(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmLogoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmLogoutText}>Salir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de confirmación eliminar cuenta */}
        <Modal
          visible={showDeleteAccount}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteAccount(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.confirmCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>⚠️</Text>
              <Text style={styles.confirmTitle}>Eliminar Cuenta</Text>
              <Text style={styles.confirmMsg}>
                Esta acción eliminará permanentemente tu cuenta, todos tus pacientes y todas las valoraciones registradas.{'\n\n'}Esta acción NO se puede deshacer.
              </Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowDeleteAccount(false)}
                  activeOpacity={0.8}
                  disabled={deletingAccount}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.8}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.confirmDeleteText}>Eliminar todo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  headerIcon: { width: 28, height: 28, tintColor: Colors.text, opacity: 0.4 },
  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    borderWidth: 3, borderColor: Colors.border,
  },
  avatarImg: { width: 44, height: 44, tintColor: Colors.text },
  name: { fontSize: FontSize.xl, color: Colors.text, fontWeight: '800' },
  roleBadge: {
    marginTop: Spacing.xs, backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full,
  },
  roleText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },
  // Info card
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl, padding: Spacing.lg, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.small,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  infoIcon: { width: 20, height: 20, tintColor: Colors.text },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: FontSize.md, color: Colors.text, fontWeight: '600', marginTop: 1 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 52 },
  // Legal
  legalSection: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  legalSectionTitle: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.text,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  consentBadge: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  consentBadgeTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  consentBadgeSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  legalCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  legalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  legalCardIcon: { fontSize: 22 },
  legalCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  legalCardSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  legalChevron: { fontSize: FontSize.sm, color: Colors.textSecondary },
  legalBody: {
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md,
  },
  legalBodyText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 20 },
  legalBold: { fontWeight: '700', color: Colors.text },
  // Logout
  logoutButton: {
    marginHorizontal: Spacing.xl, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.danger + '40',
  },
  logoutText: { fontSize: FontSize.md, color: Colors.danger, fontWeight: '700' },
  // Delete Account
  deleteAccountButton: {
    marginHorizontal: Spacing.xl, backgroundColor: Colors.danger,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.md,
  },
  deleteAccountText: { fontSize: FontSize.md, color: Colors.white, fontWeight: '700' },
  deleteAccountSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xl },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl,
  },
  confirmCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl, width: '100%', maxWidth: 380, alignItems: 'center',
  },
  confirmTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  confirmMsg: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  confirmBtns: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  confirmLogoutBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  confirmLogoutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  confirmDeleteBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  confirmDeleteText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
