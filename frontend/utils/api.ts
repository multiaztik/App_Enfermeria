/**
 * Cliente API — BitCare
 * Centraliza todas las llamadas al backend FastAPI
 * URL base: http://localhost:8000 (misma red local)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esto si el backend corre en otro host o puerto
export const API_BASE = 'http://localhost:8000/api';

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

/**
 * Función base de fetch con manejo de errores y token automático
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  // Obtener token de storage si no se pasó explícitamente
  const authToken = token !== undefined ? token : await AsyncStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {
      // no-op
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

/* ── Auth ────────────────────────────────────────────────────────────── */

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    role: string;
    cedula: string;
    created_at: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      token: null, // sin token en login
    }),

  register: (data: {
    email: string;
    password: string;
    nombre: string;
    cedula: string;
    role?: string;
  }) =>
    apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: { role: 'nurse', ...data },
      token: null,
    }),

  me: () => apiFetch<LoginResponse['user']>('/auth/me'),
};

/* ── Patients ─────────────────────────────────────────────────────────── */

export interface ApiPatient {
  id: string;
  qr_code: string;
  personal_data: {
    nombre: string;
    edad: number;
    sexo: string;
    peso?: number;
    talla?: number;
    alergias: string[];
    diagnostico_medico: string;
  };
  created_at: string;
  updated_at: string;
}

export const patientsApi = {
  getAll: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch<ApiPatient[]>(`/patients${qs}`);
  },

  getById: (id: string) => apiFetch<ApiPatient>(`/patients/${id}`),

  create: (data: {
    qr_code: string;
    personal_data: ApiPatient['personal_data'];
  }) =>
    apiFetch<ApiPatient>('/patients', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: { personal_data: Partial<ApiPatient['personal_data']> }) =>
    apiFetch<ApiPatient>(`/patients/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/patients/${id}`, {
      method: 'DELETE',
    }),
};

/* ── Assessments ──────────────────────────────────────────────────────── */

export interface ApiAssessment {
  id: string;
  patient_id: string;
  nurse_id: string;
  date: string;
  patterns: Record<string, Record<string, unknown>>;
  suggestions: {
    code: string;
    nameEs: string;
    priority: 'high' | 'medium' | 'low';
    evidence: string[];
  }[];
  status: string;
  synced: boolean;
  created_at: string;
}

export const assessmentsApi = {
  create: (data: { patient_id: string; patterns: Record<string, unknown> }) =>
    apiFetch<ApiAssessment>('/assessments', {
      method: 'POST',
      body: data,
    }),

  getAll: (patientId?: string) => {
    const qs = patientId ? `?patient_id=${patientId}` : '';
    return apiFetch<ApiAssessment[]>(`/assessments${qs}`);
  },

  evaluate: (patterns: Record<string, unknown>) =>
    apiFetch<ApiAssessment['suggestions']>('/assessments/evaluate', {
      method: 'POST',
      body: patterns,
    }),
};
