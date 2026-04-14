/**
 * Contexto de Valoración Clínica — BitCare
 * Conectado al backend FastAPI + MongoDB
 * Pacientes y valoraciones reales, con fallback offline
 */
import React, { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { evaluateNanda, NandaDiagnosis } from '../utils/nandaRules';
import { patientsApi, assessmentsApi, ApiPatient } from '../utils/api';

export interface Patient {
  id: string;
  qr_code: string;
  nombre: string;
  edad: number;
  sexo: string;
  peso?: number;
  talla?: number;
  alergias: string[];
  diagnostico_medico: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  date: string;
  nurseId: string;
  patterns: Record<string, Record<string, unknown>>;
  suggestions: NandaDiagnosis[];
  status: 'in_progress' | 'completed';
  synced: boolean;
}

interface AssessmentState {
  currentPatient: Patient | null;
  currentAssessment: Assessment | null;
  patients: Patient[];
  assessments: Assessment[];
  isLoading: boolean;
  suggestions: NandaDiagnosis[];
}

type AssessmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PATIENT'; payload: Patient }
  | { type: 'CLEAR_PATIENT' }
  | { type: 'SET_PATIENTS'; payload: Patient[] }
  | { type: 'START_ASSESSMENT'; payload: Assessment }
  | { type: 'UPDATE_PATTERN'; payload: { patternId: string; data: Record<string, unknown> } }
  | { type: 'COMPLETE_ASSESSMENT' }
  | { type: 'SET_SUGGESTIONS'; payload: NandaDiagnosis[] }
  | { type: 'LOAD_ASSESSMENTS'; payload: Assessment[] };

const initialState: AssessmentState = {
  currentPatient: null,
  currentAssessment: null,
  patients: [],
  assessments: [],
  isLoading: false,
  suggestions: [],
};

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PATIENT':
      return { ...state, currentPatient: action.payload };
    case 'CLEAR_PATIENT':
      return { ...state, currentPatient: null, currentAssessment: null, suggestions: [] };
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload };
    case 'START_ASSESSMENT':
      return { ...state, currentAssessment: action.payload, suggestions: [] };
    case 'UPDATE_PATTERN': {
      if (!state.currentAssessment) return state;
      const updatedAssessment = {
        ...state.currentAssessment,
        patterns: {
          ...state.currentAssessment.patterns,
          [action.payload.patternId]: action.payload.data,
        },
      };
      // Re-evaluar sugerencias NANDA en tiempo real (local)
      const suggestions = evaluateNanda(updatedAssessment.patterns);
      return { ...state, currentAssessment: updatedAssessment, suggestions };
    }
    case 'COMPLETE_ASSESSMENT': {
      if (!state.currentAssessment) return state;
      const completed = {
        ...state.currentAssessment,
        status: 'completed' as const,
        synced: true,
        suggestions: state.suggestions,
      };
      return {
        ...state,
        currentAssessment: completed,
        assessments: [completed, ...state.assessments],
      };
    }
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'LOAD_ASSESSMENTS':
      return { ...state, assessments: action.payload };
    default:
      return state;
  }
}

/** Convierte el formato API → formato interno Patient */
function apiPatientToPatient(p: ApiPatient): Patient {
  return {
    id: p.id,
    qr_code: p.qr_code,
    nombre: p.personal_data.nombre,
    edad: p.personal_data.edad,
    sexo: p.personal_data.sexo,
    peso: p.personal_data.peso,
    talla: p.personal_data.talla,
    alergias: p.personal_data.alergias,
    diagnostico_medico: p.personal_data.diagnostico_medico,
  };
}

interface AssessmentContextType extends AssessmentState {
  selectPatient: (patient: Patient) => void;
  clearPatient: () => void;
  startAssessment: (patientId: string) => void;
  updatePattern: (patternId: string, data: Record<string, unknown>) => void;
  completeAssessment: () => Promise<void>;
  findPatientByQR: (qrCode: string) => Patient | undefined;
  loadMockPatients: () => void;        // funciona como loadPatients (compatibilidad)
  loadPatients: (search?: string) => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Pacientes mock como fallback offline
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    qr_code: 'UAZ-2026-001',
    nombre: 'Juan Pérez García',
    edad: 45,
    sexo: 'M',
    peso: 72.5,
    talla: 1.68,
    alergias: ['Penicilina'],
    diagnostico_medico: 'Diabetes Mellitus Tipo 2',
  },
  {
    id: '2',
    qr_code: 'UAZ-2026-002',
    nombre: 'María López Hernández',
    edad: 62,
    sexo: 'F',
    peso: 58.0,
    talla: 1.55,
    alergias: [],
    diagnostico_medico: 'Hipertensión Arterial',
  },
  {
    id: '3',
    qr_code: 'UAZ-2026-003',
    nombre: 'Carlos Ramírez Torres',
    edad: 78,
    sexo: 'M',
    peso: 50.2,
    talla: 1.70,
    alergias: ['Sulfonamidas', 'Aspirina'],
    diagnostico_medico: 'Insuficiencia Cardíaca Congestiva',
  },
  {
    id: '4',
    qr_code: 'UAZ-2026-004',
    nombre: 'Ana Martínez Ruiz',
    edad: 34,
    sexo: 'F',
    peso: 95.0,
    talla: 1.60,
    alergias: [],
    diagnostico_medico: 'Embarazo 32 SDG',
  },
  {
    id: '5',
    qr_code: 'UAZ-2026-005',
    nombre: 'Roberto Díaz Flores',
    edad: 55,
    sexo: 'M',
    peso: 82.0,
    talla: 1.75,
    alergias: ['Ibuprofeno'],
    diagnostico_medico: 'EPOC',
  },
];

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const selectPatient = (patient: Patient) => {
    dispatch({ type: 'SET_PATIENT', payload: patient });
  };

  const clearPatient = () => {
    dispatch({ type: 'CLEAR_PATIENT' });
  };

  const startAssessment = (patientId: string) => {
    const assessment: Assessment = {
      id: `assess-${Date.now()}`,
      patientId,
      date: new Date().toISOString(),
      nurseId: 'current',
      patterns: {},
      suggestions: [],
      status: 'in_progress',
      synced: false,
    };
    dispatch({ type: 'START_ASSESSMENT', payload: assessment });
  };

  const updatePattern = (patternId: string, data: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_PATTERN', payload: { patternId, data } });
  };

  /**
   * Completar valoración:
   * 1. Guarda en MongoDB via API
   * 2. Si falla, guarda localmente (modo offline)
   * 3. Actualiza el estado global
   */
  const completeAssessment = async () => {
    dispatch({ type: 'COMPLETE_ASSESSMENT' });

    try {
      // Intentar guardar en MongoDB
      if (state.currentAssessment) {
        await assessmentsApi.create({
          patient_id: state.currentAssessment.patientId,
          patterns: state.currentAssessment.patterns,
        });
      }
    } catch (error) {
      console.warn('No se pudo guardar en el servidor, guardando localmente:', error);
      // Fallback offline
      try {
        const stored = await AsyncStorage.getItem('assessments_offline');
        const assessments = stored ? JSON.parse(stored) : [];
        assessments.unshift(state.currentAssessment);
        await AsyncStorage.setItem('assessments_offline', JSON.stringify(assessments));
      } catch (storageError) {
        console.error('Error guardando offline:', storageError);
      }
    }
  };

  /**
   * Cargar pacientes desde el API real
   * Fallback a datos mock si el servidor no responde
   */
  const loadPatients = async (search?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiPatients = await patientsApi.getAll(search);
      const patients = apiPatients.map(apiPatientToPatient);
      dispatch({ type: 'SET_PATIENTS', payload: patients });
    } catch (error) {
      console.warn('Backend no disponible, usando datos mock:', error);
      // Usar mock solo si no hay pacientes cargados
      if (state.patients.length === 0) {
        dispatch({ type: 'SET_PATIENTS', payload: MOCK_PATIENTS });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /** Compatibilidad con pantallas que llaman loadMockPatients */
  const loadMockPatients = () => {
    loadPatients(); // intenta API primero, fallback a mock
  };

  const findPatientByQR = (qrCode: string): Patient | undefined => {
    return state.patients.find((p) => p.qr_code === qrCode);
  };

  return (
    <AssessmentContext.Provider
      value={{
        ...state,
        selectPatient,
        clearPatient,
        startAssessment,
        updatePattern,
        completeAssessment,
        findPatientByQR,
        loadMockPatients,
        loadPatients,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextType {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment debe usarse dentro de un AssessmentProvider');
  }
  return context;
}
