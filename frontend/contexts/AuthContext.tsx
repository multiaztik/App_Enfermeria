/**
 * Contexto de Autenticación — BitCare
 * Login / Register / Logout locales con SQLite
 * Sin servidor — todo se almacena en el dispositivo
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser, DBUser } from '../utils/database';

interface User {
  id: string;
  username: string;
  nombre: string;
  role: string;
  cedula: string;
  consentimiento_legal: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User } };

const initialState: AuthState = {
  user: null,
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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    nombre: string;
    cedula: string;
    consentimiento_legal: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Convierte DBUser a User del contexto */
function dbUserToUser(dbUser: DBUser): User {
  return {
    id: String(dbUser.id),
    username: dbUser.username,
    nombre: dbUser.nombre,
    role: dbUser.role,
    cedula: dbUser.cedula,
    consentimiento_legal: dbUser.consentimiento_legal,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { user: JSON.parse(userData) },
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
   * Login local con SQLite
   * Busca el usuario en la BD local y valida la contraseña
   */
  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const dbUser = await loginUser(username, password);
      const user = dbUserToUser(dbUser);

      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      dispatch({ type: 'LOGIN', payload: { user } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error; // re-lanzar para que el UI pueda mostrar el error
    }
  };

  /**
   * Registro local — crea usuario en SQLite y hace login automático
   */
  const register = async (data: {
    username: string;
    password: string;
    nombre: string;
    cedula: string;
    consentimiento_legal: boolean;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const dbUser = await registerUser(data);
      const user = dbUserToUser(dbUser);

      await AsyncStorage.setItem('user_data', JSON.stringify(user));

      dispatch({ type: 'LOGIN', payload: { user } });
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
