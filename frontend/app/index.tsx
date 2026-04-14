/**
 * Pantalla de Splash / Landing — Diseño BitCare
 * Logo con pin + cruz médica, fondo blanco, animación suave
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize, Spacing } from '../constants/colors';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading bar animation
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim, scaleAnim, barAnim]);

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

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo pin.png */}
        <Image
          source={require('../assets/icons/pin.png')}
          style={styles.pinImage}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>BitCare</Text>
        <Text style={styles.subtitle}>Valoración Clínica Inteligente</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingFill, { width: barWidth }]} />
        </View>
        <Text style={styles.version}>v1.0.0 • Patrones de Gordon</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
  },
  pinImage: {
    width: 100,
    height: 100,
    tintColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: FontSize.huge,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingBar: {
    width: 140,
    height: 4,
    backgroundColor: Colors.card,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  loadingFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
