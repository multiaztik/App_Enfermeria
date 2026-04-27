/**
 * Layout raíz de la aplicación — BitCare
 * Configura providers, navegación y SafeArea
 * Sin ruta de scanner QR
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { AssessmentProvider } from '../contexts/AssessmentContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AssessmentProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.text,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="assessment/[patientId]"
              options={{
                title: 'Valoración Clínica',
                headerBackTitle: 'Atrás',
              }}
            />
          </Stack>
        </AssessmentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
