/**
 * Pantalla de Perfil del Enfermero — Diseño BitCare
 * Avatar con ícono PNG, info card limpia, logout negro
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
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
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
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <Image
              source={require('../../assets/icons/hospital.png')}
              style={styles.infoIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Institución</Text>
            <Text style={styles.infoValue}>UAZ - Clínica Universitaria</Text>
          </View>
        </View>
      </View>

      {/* Ajustes */}
      <Text style={styles.sectionLabel}>Configuración</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}>
            <Image
              source={require('../../assets/icons/ambulancia.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.menuText}>Notificaciones</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}>
            <Image
              source={require('../../assets/icons/estetoscopio.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.menuText}>Sincronización</Text>
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>Conectado</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}>
            <Image
              source={require('../../assets/icons/pin.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.menuText}>Acerca de BitCare</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Botón logout */}
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
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.text,
    opacity: 0.4,
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  avatarImg: {
    width: 44,
    height: 44,
    tintColor: Colors.text,
  },
  name: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: '800',
  },
  roleBadge: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: '700',
  },
  // Section label
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Info card
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.text,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 52,
  },
  // Menu card
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.text,
  },
  menuText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '300',
  },
  syncBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  syncBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  // Logout
  logoutButton: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.danger + '40',
  },
  logoutText: {
    fontSize: FontSize.md,
    color: Colors.danger,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
  // Modal logout confirm
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  confirmCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  confirmMsg: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  confirmLogoutText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});

