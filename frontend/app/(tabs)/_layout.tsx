/**
 * Layout de tabs — Barra de navegación BitCare
 * Íconos PNG del paquete de assets
 */
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: any;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Image
          source={icon}
          style={[styles.tabImg, focused && styles.tabImgActive]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          shadowColor: Colors.border,
          elevation: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: FontSize.lg },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: Colors.primary,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require('../../assets/icons/hospital.png')}
              label="Inicio"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require('../../assets/icons/enfermera.png')}
              label="Pacientes"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require('../../assets/icons/portapapeles.png')}
              label="Historial"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require('../../assets/icons/doctor.png')}
              label="Perfil"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
  },
  tabImg: {
    width: 22,
    height: 22,
    tintColor: 'rgba(255,255,255,0.5)',
  },
  tabImgActive: {
    tintColor: Colors.white,
  },
  tabLabel: {
    fontSize: FontSize.xs - 1,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
