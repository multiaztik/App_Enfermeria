/**
 * Pantalla de Perfil del Enfermero — BitCare
 * Avatar con ícono PNG, info card, sección legal LFPDPPP, logout negro
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
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showConsent, setShowConsent] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const initials =
    user?.nombre
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('') || '?';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* ─── MARCO LEGAL E INVESTIGACIÓN ─── */}
      <View style={styles.legalSection}>
        <Text style={styles.legalSectionTitle}>⚖️ Marco Legal e Investigación</Text>

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
            <Text style={styles.legalCardIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.legalCardTitle}>Aviso de Privacidad Integral</Text>
              <Text style={styles.legalCardSub}>LFPDPPP • NOM-024-SSA3-2012</Text>
            </View>
            <Text style={styles.legalChevron}>{showPrivacy ? '▲' : '▼'}</Text>
          </View>
          {showPrivacy && (
            <View style={styles.legalBody}>
              <Text style={styles.legalBodyText}>
                <Text style={styles.legalBold}>Responsable: </Text>
                {'Facultad de Ingeniería, UAZ.\n\n'}
                <Text style={styles.legalBold}>Datos recabados: </Text>
                {'Nombre de usuario, cédula profesional y datos clínicos de pacientes en formatos de valoración.\n\n'}
                <Text style={styles.legalBold}>Finalidad: </Text>
                {'Gestión interna de valoraciones de enfermería con fines académicos y de investigación de usabilidad de software.\n\n'}
                <Text style={styles.legalBold}>Almacenamiento: </Text>
                {'Datos almacenados exclusivamente en este dispositivo (SQLite local). No se transmiten a servidores externos.\n\n'}
                <Text style={styles.legalBold}>Derechos ARCO: </Text>
                {'Puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando al responsable del proyecto.'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Consentimiento de Investigación */}
        <TouchableOpacity
          style={styles.legalCard}
          onPress={() => setShowConsent(!showConsent)}
          activeOpacity={0.75}
        >
          <View style={styles.legalRow}>
            <Text style={styles.legalCardIcon}>🔬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.legalCardTitle}>Consentimiento de Investigación</Text>
              <Text style={styles.legalCardSub}>Proyecto BitCare — Tesis UAZ</Text>
            </View>
            <Text style={styles.legalChevron}>{showConsent ? '▲' : '▼'}</Text>
          </View>
          {showConsent && (
            <View style={styles.legalBody}>
              <Text style={styles.legalBodyText}>
                {'Declaro que participo '}
                <Text style={styles.legalBold}>voluntariamente</Text>
                {' en el proyecto de investigación "BitCare" de la Facultad de Ingeniería de la UAZ.\n\nEntiendo que:\n• El sistema recopila datos sobre mi interacción con la interfaz.\n• La información se utiliza exclusivamente con fines académicos.\n• Puedo retirarme del proyecto en cualquier momento eliminando mi cuenta.\n• Los datos no serán distribuidos ni vendidos a terceros.\n\nEste consentimiento fue otorgado al momento del registro en la aplicación.'}
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

      <Text style={styles.version}>BitCare v1.0.0 • Patrones de Gordon</Text>
      <View style={{ height: 30 }} />

      {/* Modal de confirmación — funciona en web y móvil */}
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
    </ScrollView>
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
});
