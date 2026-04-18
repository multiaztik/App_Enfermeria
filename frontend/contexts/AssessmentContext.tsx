/**
 * Contexto de Valoración Clínica — BitCare
 * Almacenamiento local con SQLite — sin servidor
 * Pacientes y valoraciones persistentes por usuario
 */
import React, { createContext, useContext, useReducer } from 'react';
import { evaluateNanda, NandaDiagnosis } from '../utils/nandaRules';
import { useAuth } from './AuthContext';
import {
  getPatients as dbGetPatients,
  createPatient as dbCreatePatient,
  updatePatient as dbUpdatePatient,
  deletePatient as dbDeletePatient,
  saveAssessment as dbSaveAssessment,
  getAssessments as dbGetAssessments,
  DBPatient,
} from '../utils/database';

export interface Patient {
  id: string;
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
  | { type: 'COMPLETE_ASSESSMENT'; payload: Assessment }
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
      return {
        ...state,
        currentAssessment: action.payload,
        assessments: [action.payload, ...state.assessments],
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

/** Convierte DBPatient → Patient del contexto */
function dbPatientToPatient(p: DBPatient): Patient {
  return {
    id: String(p.id),
    nombre: p.nombre,
    edad: p.edad,
    sexo: p.sexo,
    peso: p.peso ?? undefined,
    talla: p.talla ?? undefined,
    alergias: p.alergias,
    diagnostico_medico: p.diagnostico_medico,
  };
}

interface AssessmentContextType extends AssessmentState {
  selectPatient: (patient: Patient) => void;
  clearPatient: () => void;
  startAssessment: (patientId: string) => void;
  updatePattern: (patternId: string, data: Record<string, unknown>) => void;
  completeAssessment: () => Promise<void>;
  loadPatients: (search?: string) => Promise<void>;
  loadMockPatients: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);
  const { user } = useAuth();

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
      nurseId: user?.id || 'unknown',
      patterns: {},
      suggestions: [],
      status: 'in_progress',
    };
    dispatch({ type: 'START_ASSESSMENT', payload: assessment });
  };

  const updatePattern = (patternId: string, data: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_PATTERN', payload: { patternId, data } });
  };

  /**
   * Completar valoración:
   * Guarda directamente en SQLite — sin red, sin servidor
   */
  const completeAssessment = async () => {
    if (!state.currentAssessment || !user) return;

    try {
      const saved = await dbSaveAssessment(Number(user.id), {
        patient_id: Number(state.currentAssessment.patientId),
        patterns: state.currentAssessment.patterns,
        suggestions: state.suggestions,
        status: 'completed',
      });

      const completed: Assessment = {
        ...state.currentAssessment,
        id: String(saved.id),
        status: 'completed',
        suggestions: state.suggestions,
      };

      dispatch({ type: 'COMPLETE_ASSESSMENT', payload: completed });
    } catch (error) {
      console.error('Error guardando valoración:', error);
      // Si falla SQLite, igualmente completar en memoria
      const completed: Assessment = {
        ...state.currentAssessment,
        status: 'completed',
        suggestions: state.suggestions,
      };
      dispatch({ type: 'COMPLETE_ASSESSMENT', payload: completed });
    }
  };

  /**
   * Cargar pacientes desde SQLite (filtrados por usuario logueado)
   */
  const loadPatients = async (search?: string) => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const dbPatients = await dbGetPatients(Number(user.id), search);
      const patients = dbPatients.map(dbPatientToPatient);
      dispatch({ type: 'SET_PATIENTS', payload: patients });
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /** Compatibilidad con pantallas que llaman loadMockPatients */
  const loadMockPatients = () => {
    loadPatients();
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
        loadPatients,
        loadMockPatients,
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
