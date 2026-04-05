/**
 * Contexto de Autenticación
 * Maneja el estado global del usuario (enfermero) autenticado
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  nombre: string;
  role: string;
  cedula: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; nombre: string; cedula: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');
        if (token && userData) {
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { token, user: JSON.parse(userData) },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, _password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Conectar con FastAPI cuando el backend esté listo
      // Por ahora, simulamos login para desarrollo
      const mockUser: User = {
        id: '1',
        email,
        nombre: 'Enfermero Demo',
        role: 'nurse',
        cedula: '12345678',
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      await AsyncStorage.setItem('auth_token', mockToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

      dispatch({ type: 'LOGIN', payload: { user: mockUser, token: mockToken } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (data: { email: string; password: string; nombre: string; cedula: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Conectar con FastAPI
      const mockUser: User = {
        id: '2',
        email: data.email,
        nombre: data.nombre,
        role: 'nurse',
        cedula: data.cedula,
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      await AsyncStorage.setItem('auth_token', mockToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

      dispatch({ type: 'LOGIN', payload: { user: mockUser, token: mockToken } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
