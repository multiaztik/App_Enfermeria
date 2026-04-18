/**
 * Pantalla de Registro de Enfermero — BitCare
 * Crea una cuenta real en MongoDB y entra directamente a la app
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../constants/colors';

const PIN_ICON = require('../assets/icons/pin.png');

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    setError('');
    if (!nombre.trim() || !email.trim() || !cedula.trim() || !password.trim()) {
      setError('Todos los campos son requeridos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await register({ email: email.trim(), password, nombre: nombre.trim(), cedula: cedula.trim() });
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al registrarse';
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrap}>
              <Image source={PIN_ICON} style={styles.pinImg} resizeMode="contain" />
            </View>
            <Text style={styles.brand}>BitCare</Text>
            <Text style={styles.subtitle}>Crear cuenta de enfermero/a</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Nombre */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: María González"
                placeholderTextColor={Colors.textMuted}
                value={nombre}
                onChangeText={(v) => { setNombre(v); setError(''); }}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Correo institucional</Text>
              <TextInput
                style={styles.input}
                placeholder="enfermero@uaz.edu.mx"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Cédula */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Cédula Profesional</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 12345678"
                placeholderTextColor={Colors.textMuted}
                value={cedula}
                onChangeText={(v) => { setCedula(v); setError(''); }}
                keyboardType="numeric"
              />
            </View>

            {/* Contraseña */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <View style={styles.passWrap}>
                <TextInput
                  style={styles.passInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
              <TextInput
                style={[styles.input, confirm && confirm !== password && styles.inputError]}
                placeholder="Repite la contraseña"
                placeholderTextColor={Colors.textMuted}
                value={confirm}
                onChangeText={(v) => { setConfirm(v); setError(''); }}
                secureTextEntry={!showPass}
              />
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Ir a login */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.replace('/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.huge,
  },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoWrap: { marginBottom: Spacing.md },
  pinImg: { width: 60, height: 60, tintColor: Colors.primary },
  brand: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { width: '100%' },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  errorText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '600', textAlign: 'center' },
  field: { marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  inputError: { borderColor: Colors.danger },
  passWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  passInput: { flex: 1, paddingVertical: Spacing.md + 2, fontSize: FontSize.md, color: Colors.text },
  eyeBtn: { padding: Spacing.xs },
  eyeIcon: { fontSize: 16, opacity: 0.6 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg + 2,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: FontSize.lg, color: Colors.white, fontWeight: '700' },
  loginLink: { marginTop: Spacing.xl, alignItems: 'center' },
  loginLinkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLinkBold: { fontWeight: '700', color: Colors.text },
});
