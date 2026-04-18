/**
 * Acordeón (Collapsible) con animación — Diseño BitCare
 * Soporta íconos PNG y emoji, con header negro cuando está abierto
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, Shadows } from '../../constants/colors';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
  title: string;
  icon?: string;
  iconImage?: any;  // PNG require() image source
  color?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({
  title,
  icon,
  iconImage,
  color,
  badge,
  badgeColor,
  children,
  defaultOpen = false,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <TouchableOpacity
        style={[styles.header, isOpen && styles.headerOpen]}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          {/* Ícono PNG o emoji */}
          {(iconImage || icon) && (
            <View style={[styles.iconContainer, isOpen && styles.iconContainerOpen]}>
              {iconImage ? (
                <Image
                  source={iconImage}
                  style={[styles.iconImg, isOpen && styles.iconImgOpen]}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.icon}>{icon}</Text>
              )}
            </View>
          )}
          <Text style={[styles.title, isOpen && styles.titleOpen]}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: (badgeColor || Colors.success) + '25' }]}>
              <Text style={[styles.badgeText, { color: badgeColor || Colors.success }]}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Animated.Text style={[styles.chevron, isOpen && styles.chevronOpen, rotateStyle]}>
          ∨
        </Animated.Text>
      </TouchableOpacity>

      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  containerOpen: {
    borderColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 4,
    backgroundColor: Colors.surface,
  },
  headerOpen: {
    backgroundColor: Colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.card,
  },
  iconContainerOpen: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconImg: {
    width: 22,
    height: 22,
    tintColor: Colors.text,
  },
  iconImgOpen: {
    tintColor: Colors.white,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
  },
  titleOpen: {
    color: Colors.white,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  chevron: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontWeight: '700',
  },
  chevronOpen: {
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
  },
});
