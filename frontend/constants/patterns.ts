/**
 * Definición de los Patrones Funcionales de Gordon
 * MVP: Nutricional-Metabólico, Sueño-Descanso, Tolerancia al Estrés
 */

export interface PatternField {
  id: string;
  label: string;
  type: 'toggle' | 'slider' | 'select' | 'text' | 'number' | 'multiselect' | 'body_map';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  isSeedQuestion?: boolean;
  showWhen?: { fieldId: string; value: unknown };
  required?: boolean;
  placeholder?: string;
}

export interface PatternDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  fields: PatternField[];
  isMvp: boolean;
}

export const PATTERNS: PatternDefinition[] = [
  {
    id: 'nutritional',
    name: 'Nutricional-Metabólico',
    icon: '🍎',
    color: '#22C55E',
    description: 'Evalúa el estado nutricional, metabólico e integridad de la piel.',
    isMvp: true,
    fields: [
      {
        id: 'weight',
        label: 'Peso (kg)',
        type: 'number',
        min: 20,
        max: 250,
        unit: 'kg',
        required: true,
        placeholder: 'Ej: 72.5',
      },
      {
        id: 'height',
        label: 'Talla (m)',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.01,
        unit: 'm',
        required: true,
        placeholder: 'Ej: 1.68',
      },
      {
        id: 'appetite',
        label: 'Apetito',
        type: 'select',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Aumentado', value: 'increased' },
          { label: 'Disminuido', value: 'decreased' },
          { label: 'Ausente', value: 'absent' },
        ],
        required: true,
      },
      {
        id: 'swallowing_difficulty',
        label: '¿Dificultad para deglutir?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'swallowing_type',
        label: 'Tipo de disfagia',
        type: 'select',
        options: [
          { label: 'Sólidos', value: 'solids' },
          { label: 'Líquidos', value: 'liquids' },
          { label: 'Ambos', value: 'both' },
        ],
        showWhen: { fieldId: 'swallowing_difficulty', value: true },
      },
      {
        id: 'nausea_vomiting',
        label: '¿Náuseas o vómitos?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'vomiting_frequency',
        label: 'Frecuencia de vómitos (veces/día)',
        type: 'slider',
        min: 1,
        max: 10,
        step: 1,
        showWhen: { fieldId: 'nausea_vomiting', value: true },
      },
      {
        id: 'oral_condition',
        label: 'Estado de mucosa oral',
        type: 'select',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Seca', value: 'dry' },
          { label: 'Con lesiones', value: 'lesions' },
          { label: 'Inflamada', value: 'inflamed' },
        ],
        required: true,
      },
      {
        id: 'skin_turgor',
        label: 'Turgencia de la piel',
        type: 'select',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Disminuida', value: 'decreased' },
          { label: 'Aumentada', value: 'increased' },
        ],
      },
      {
        id: 'edema_present',
        label: '¿Presencia de edema?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'edema_locations',
        label: 'Localización del edema',
        type: 'body_map',
        showWhen: { fieldId: 'edema_present', value: true },
      },
      {
        id: 'skin_lesions',
        label: '¿Lesiones en piel?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'lesion_locations',
        label: 'Localización de lesiones',
        type: 'body_map',
        showWhen: { fieldId: 'skin_lesions', value: true },
      },
      {
        id: 'lesion_type',
        label: 'Tipo de lesión',
        type: 'multiselect',
        options: [
          { label: 'Úlcera por presión', value: 'pressure_ulcer' },
          { label: 'Herida quirúrgica', value: 'surgical_wound' },
          { label: 'Quemadura', value: 'burn' },
          { label: 'Dermatitis', value: 'dermatitis' },
          { label: 'Otra', value: 'other' },
        ],
        showWhen: { fieldId: 'skin_lesions', value: true },
      },
      {
        id: 'glucose',
        label: 'Glucosa (mg/dL)',
        type: 'number',
        min: 30,
        max: 600,
        unit: 'mg/dL',
        placeholder: 'Ej: 110',
      },
      {
        id: 'albumin',
        label: 'Albúmina (g/dL)',
        type: 'number',
        min: 0.5,
        max: 7,
        step: 0.1,
        unit: 'g/dL',
        placeholder: 'Ej: 3.5',
      },
    ],
  },
  {
    id: 'sleep',
    name: 'Sueño-Descanso',
    icon: '🌙',
    color: '#6366F1',
    description: 'Evalúa la calidad y cantidad del sueño y descanso.',
    isMvp: true,
    fields: [
      {
        id: 'sleep_normal',
        label: '¿Patrón de sueño sin alteraciones?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'hours_sleep',
        label: 'Horas de sueño por noche',
        type: 'slider',
        min: 0,
        max: 14,
        step: 0.5,
        unit: 'horas',
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
      {
        id: 'sleep_quality',
        label: 'Calidad del sueño',
        type: 'select',
        options: [
          { label: 'Buena', value: 'good' },
          { label: 'Regular', value: 'fair' },
          { label: 'Mala', value: 'poor' },
        ],
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
      {
        id: 'insomnia',
        label: 'Tipo de insomnio',
        type: 'select',
        options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'De conciliación', value: 'onset' },
          { label: 'De mantenimiento', value: 'maintenance' },
          { label: 'Despertar temprano', value: 'early_waking' },
        ],
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
      {
        id: 'sleep_aids',
        label: '¿Usa medicación para dormir?',
        type: 'toggle',
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
      {
        id: 'sleep_aid_name',
        label: 'Nombre del medicamento',
        type: 'text',
        showWhen: { fieldId: 'sleep_aids', value: true },
        placeholder: 'Ej: Zolpidem 10mg',
      },
      {
        id: 'fatigue_level',
        label: 'Nivel de fatiga diurna',
        type: 'slider',
        min: 0,
        max: 10,
        step: 1,
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
      {
        id: 'sleep_environment',
        label: 'Factores ambientales que afectan el sueño',
        type: 'multiselect',
        options: [
          { label: 'Ruido', value: 'noise' },
          { label: 'Luz', value: 'light' },
          { label: 'Temperatura', value: 'temperature' },
          { label: 'Dolor', value: 'pain' },
          { label: 'Ansiedad', value: 'anxiety' },
        ],
        showWhen: { fieldId: 'sleep_normal', value: false },
      },
    ],
  },
  {
    id: 'stress',
    name: 'Tolerancia al Estrés',
    icon: '🧠',
    color: '#F59E0B',
    description: 'Evalúa los niveles de estrés, afrontamiento y adaptación.',
    isMvp: true,
    fields: [
      {
        id: 'stress_level',
        label: 'Nivel de estrés percibido',
        type: 'select',
        options: [
          { label: 'Bajo', value: 'low' },
          { label: 'Moderado', value: 'moderate' },
          { label: 'Alto', value: 'high' },
          { label: 'Severo', value: 'severe' },
        ],
        required: true,
      },
      {
        id: 'coping_strategy',
        label: 'Estrategia de afrontamiento',
        type: 'select',
        options: [
          { label: 'Adecuada', value: 'adequate' },
          { label: 'Inadecuada', value: 'inadequate' },
          { label: 'Ausente', value: 'absent' },
        ],
        required: true,
      },
      {
        id: 'anxiety_signs',
        label: '¿Manifiesta signos de ansiedad?',
        type: 'toggle',
        isSeedQuestion: true,
      },
      {
        id: 'anxiety_symptoms',
        label: 'Síntomas de ansiedad',
        type: 'multiselect',
        options: [
          { label: 'Taquicardia', value: 'tachycardia' },
          { label: 'Diaforesis', value: 'diaphoresis' },
          { label: 'Temblor', value: 'tremor' },
          { label: 'Inquietud', value: 'restlessness' },
          { label: 'Llanto', value: 'crying' },
          { label: 'Nerviosismo', value: 'nervousness' },
        ],
        showWhen: { fieldId: 'anxiety_signs', value: true },
      },
      {
        id: 'support_system',
        label: '¿Cuenta con sistema de apoyo?',
        type: 'toggle',
      },
      {
        id: 'support_type',
        label: 'Tipo de apoyo',
        type: 'multiselect',
        options: [
          { label: 'Familia', value: 'family' },
          { label: 'Amigos', value: 'friends' },
          { label: 'Religión/Espiritualidad', value: 'religion' },
          { label: 'Profesional (Psicólogo)', value: 'professional' },
          { label: 'Grupos de apoyo', value: 'support_groups' },
        ],
        showWhen: { fieldId: 'support_system', value: true },
      },
      {
        id: 'recent_changes',
        label: 'Cambios recientes significativos',
        type: 'multiselect',
        options: [
          { label: 'Pérdida familiar', value: 'family_loss' },
          { label: 'Cambio de empleo', value: 'job_change' },
          { label: 'Diagnóstico nuevo', value: 'new_diagnosis' },
          { label: 'Hospitalización', value: 'hospitalization' },
          { label: 'Cambio de domicilio', value: 'relocation' },
        ],
      },
      {
        id: 'emotional_state',
        label: 'Estado emocional actual',
        type: 'select',
        options: [
          { label: 'Estable / Tranquilo', value: 'stable' },
          { label: 'Irritable', value: 'irritable' },
          { label: 'Triste / Deprimido', value: 'sad' },
          { label: 'Temeroso', value: 'fearful' },
          { label: 'Enojado', value: 'angry' },
        ],
        required: true,
      },
    ],
  },
];

// Patrones futuros (post-MVP placeholders)
export const FUTURE_PATTERNS = [
  { id: 'perception', name: 'Percepción-Manejo de Salud', icon: '🏥', color: '#3B82F6' },
  { id: 'elimination', name: 'Eliminación', icon: '💧', color: '#06B6D4' },
  { id: 'activity', name: 'Actividad-Ejercicio', icon: '🏃', color: '#10B981' },
  { id: 'cognitive', name: 'Cognitivo-Perceptual', icon: '👁️', color: '#8B5CF6' },
  { id: 'self_perception', name: 'Autopercepción-Autoconcepto', icon: '🪞', color: '#EC4899' },
  { id: 'role', name: 'Rol-Relaciones', icon: '👥', color: '#F97316' },
  { id: 'sexuality', name: 'Sexualidad-Reproducción', icon: '♀️', color: '#E11D48' },
  { id: 'values', name: 'Valores-Creencias', icon: '🙏', color: '#A855F7' },
];
