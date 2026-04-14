/**
 * Layout raíz de la aplicación — BitCare
 * Configura providers y navegación principal
 * Sin ruta de scanner QR
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { AssessmentProvider } from '../contexts/AssessmentContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
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
          <Stack.Screen
            name="assessment/results"
            options={{
              title: 'Resultados',
              headerBackTitle: 'Atrás',
              presentation: 'modal',
            }}
          />
        </Stack>
      </AssessmentProvider>
    </AuthProvider>
  );
}
