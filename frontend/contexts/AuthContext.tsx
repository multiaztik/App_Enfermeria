/**
 * Contexto de Autenticación — BitCare
 * Conectado al backend FastAPI + MongoDB
 * Login / Register / Logout reales con JWT
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../utils/api';

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
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    nombre: string;
    cedula: string;
  }) => Promise<void>;
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

  /**
   * Login real con FastAPI + MongoDB
   * Guarda el token JWT y los datos del usuario en AsyncStorage
   */
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login(email, password);

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        nombre: response.user.nombre,
        role: response.user.role,
        cedula: response.user.cedula,
      };

      await AsyncStorage.setItem('auth_token', response.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      dispatch({ type: 'LOGIN', payload: { user, token: response.access_token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error; // re-lanzar para que el UI pueda mostrar el error
    }
  };

  /**
   * Registro real — crea usuario en MongoDB y hace login automático
   */
  const register = async (data: {
    email: string;
    password: string;
    nombre: string;
    cedula: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.register(data);

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        nombre: response.user.nombre,
        role: response.user.role,
        cedula: response.user.cedula,
      };

      await AsyncStorage.setItem('auth_token', response.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      dispatch({ type: 'LOGIN', payload: { user, token: response.access_token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  /**
   * Logout — limpia storage y estado global
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch {
      // ignorar errores de storage en web
    }
    dispatch({ type: 'LOGOUT' });
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
