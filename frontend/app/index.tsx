/**
 * Pantalla de Splash / Landing
 * Redirige a login o main tabs según estado de auth
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Spacing } from '../constants/colors';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[styles.logoIcon, { transform: [{ scale: pulseAnim }] }]}
        >
          🩺
        </Animated.Text>
        <Text style={styles.logoText}>NurseAssess</Text>
        <Text style={styles.subtitle}>Valoración Clínica Inteligente</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingFill]} />
        </View>
        <Text style={styles.version}>v1.0.0 • Patrones de Gordon</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 72,
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: FontSize.huge,
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: Spacing.sm,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingBar: {
    width: 120,
    height: 3,
    backgroundColor: Colors.card,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  loadingFill: {
    width: '60%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
