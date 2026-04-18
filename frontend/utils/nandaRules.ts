/**
 * Motor de Reglas NANDA-I para Sugerencias Diagnósticas
 * Implementa reglas booleanas para los 3 patrones del MVP
 */

export interface NandaDiagnosis {
  code: string;
  name: string;
  nameEs: string;
  priority: 'high' | 'medium' | 'low';
  evidence: string[];
  pattern: string;
}

interface AssessmentData {
  [key: string]: unknown;
}

/** Calcula el IMC a partir de peso (kg) y talla (m) */
function calculateBMI(weight: number, height: number): number {
  if (!weight || !height || height === 0) return 0;
  return weight / (height * height);
}

/** Reglas para el Patrón Nutricional-Metabólico */
function evaluateNutritional(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];
  const weight = data.weight as number;
  const height = data.height as number;
  const bmi = calculateBMI(weight, height);

  // IMC bajo → Desequilibrio Nutricional: Inferior a las Necesidades
  if (bmi > 0 && bmi < 18.5) {
    diagnoses.push({
      code: '00002',
      name: 'Desequilibrio Nutricional: Inferior a las Necesidades',
      nameEs: 'Desequilibrio Nutricional: Inferior a las Necesidades',
      priority: 'high',
      evidence: [`IMC: ${bmi.toFixed(1)} (< 18.5)`, 'Bajo peso detectado'],
      pattern: 'nutritional',
    });
  }

  // IMC alto → Desequilibrio Nutricional: Superior a las Necesidades
  if (bmi >= 30) {
    diagnoses.push({
      code: '00001',
      name: 'Desequilibrio Nutricional: Superior a las Necesidades',
      nameEs: 'Desequilibrio Nutricional: Superior a las Necesidades',
      priority: bmi >= 35 ? 'high' : 'medium',
      evidence: [`IMC: ${bmi.toFixed(1)} (≥ 30)`, 'Obesidad detectada'],
      pattern: 'nutritional',
    });
  }

  // Sobrepeso
  if (bmi >= 25 && bmi < 30) {
    diagnoses.push({
      code: '00233',
      name: 'Sobrepeso',
      nameEs: 'Sobrepeso',
      priority: 'low',
      evidence: [`IMC: ${bmi.toFixed(1)} (25-29.9)`, 'Sobrepeso detectado'],
      pattern: 'nutritional',
    });
  }

  // Disfagia → Deterioro de la Deglución
  if (data.swallowing_difficulty === true) {
    const swallowType = data.swallowing_type as string;
    diagnoses.push({
      code: '00103',
      name: 'Deterioro de la Deglución',
      nameEs: 'Deterioro de la Deglución',
      priority: 'high',
      evidence: [
        'Dificultad para deglutir presente',
        swallowType ? `Tipo: ${swallowType}` : '',
      ].filter(Boolean),
      pattern: 'nutritional',
    });
  }

  // Lesiones en piel → Deterioro de la Integridad Cutánea
  if (data.skin_lesions === true) {
    const lesionTypes = (data.lesion_type as string[]) || [];
    diagnoses.push({
      code: '00046',
      name: 'Deterioro de la Integridad Cutánea',
      nameEs: 'Deterioro de la Integridad Cutánea',
      priority: lesionTypes.includes('pressure_ulcer') ? 'high' : 'medium',
      evidence: [
        'Lesiones en piel activas',
        ...lesionTypes.map((t: string) => `Tipo: ${t}`),
      ],
      pattern: 'nutritional',
    });
  }

  // Mucosa oral alterada → Deterioro de la Mucosa Oral
  if (data.oral_condition && data.oral_condition !== 'normal') {
    diagnoses.push({
      code: '00045',
      name: 'Deterioro de la Integridad de la Mucosa Oral',
      nameEs: 'Deterioro de la Integridad de la Mucosa Oral',
      priority: 'medium',
      evidence: [`Mucosa oral: ${data.oral_condition}`],
      pattern: 'nutritional',
    });
  }

  // Edema → Exceso de Volumen de Líquidos
  if (data.edema_present === true) {
    diagnoses.push({
      code: '00026',
      name: 'Exceso de Volumen de Líquidos',
      nameEs: 'Exceso de Volumen de Líquidos',
      priority: 'medium',
      evidence: ['Edema presente'],
      pattern: 'nutritional',
    });
  }

  // Turgencia disminuida → Riesgo de Déficit de Volumen de Líquidos
  if (data.skin_turgor === 'decreased') {
    diagnoses.push({
      code: '00028',
      name: 'Riesgo de Déficit de Volumen de Líquidos',
      nameEs: 'Riesgo de Déficit de Volumen de Líquidos',
      priority: 'medium',
      evidence: ['Turgencia de piel disminuida'],
      pattern: 'nutritional',
    });
  }

  // Glucosa elevada
  const glucose = data.glucose as number;
  if (glucose && glucose > 126) {
    diagnoses.push({
      code: '00179',
      name: 'Riesgo de Nivel de Glucemia Inestable',
      nameEs: 'Riesgo de Nivel de Glucemia Inestable',
      priority: glucose > 200 ? 'high' : 'medium',
      evidence: [`Glucosa: ${glucose} mg/dL (> 126)`],
      pattern: 'nutritional',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Sueño-Descanso */
function evaluateSleep(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Si el sueño es normal, no hay diagnósticos
  if (data.sleep_normal === true) {
    return diagnoses;
  }

  const hours = data.hours_sleep as number;
  const quality = data.sleep_quality as string;
  const fatigue = data.fatigue_level as number;
  const insomnia = data.insomnia as string;

  // Insomnio
  if (insomnia && insomnia !== 'none') {
    diagnoses.push({
      code: '00095',
      name: 'Insomnio',
      nameEs: 'Insomnio',
      priority: 'high',
      evidence: [
        `Tipo de insomnio: ${insomnia}`,
        hours ? `Horas de sueño: ${hours}` : '',
      ].filter(Boolean),
      pattern: 'sleep',
    });
  }

  // Horas de sueño < 6 + calidad mala → Deprivación de sueño
  if (hours && hours < 6 && quality === 'poor') {
    diagnoses.push({
      code: '00096',
      name: 'Deprivación de Sueño',
      nameEs: 'Deprivación de Sueño',
      priority: 'high',
      evidence: [
        `Horas de sueño: ${hours} (< 6)`,
        'Calidad: Mala',
        fatigue ? `Fatiga diurna: ${fatigue}/10` : '',
      ].filter(Boolean),
      pattern: 'sleep',
    });
  }

  // Patrón del sueño alterado (catch-all)
  if (data.sleep_normal === false && !diagnoses.length) {
    diagnoses.push({
      code: '00198',
      name: 'Trastorno del Patrón de Sueño',
      nameEs: 'Trastorno del Patrón de Sueño',
      priority: 'medium',
      evidence: [
        'Alteración del patrón de sueño reportada',
        hours ? `Horas de sueño: ${hours}` : '',
        quality ? `Calidad: ${quality}` : '',
      ].filter(Boolean),
      pattern: 'sleep',
    });
  }

  // Fatiga alta
  if (fatigue && fatigue >= 7) {
    diagnoses.push({
      code: '00093',
      name: 'Fatiga',
      nameEs: 'Fatiga',
      priority: fatigue >= 9 ? 'high' : 'medium',
      evidence: [`Nivel de fatiga: ${fatigue}/10`],
      pattern: 'sleep',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Tolerancia al Estrés */
function evaluateStress(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  const stressLevel = data.stress_level as string;
  const coping = data.coping_strategy as string;

  // Estrés alto + afrontamiento inadecuado → Afrontamiento Ineficaz
  if ((stressLevel === 'high' || stressLevel === 'severe') && 
      (coping === 'inadequate' || coping === 'absent')) {
    diagnoses.push({
      code: '00069',
      name: 'Afrontamiento Ineficaz',
      nameEs: 'Afrontamiento Ineficaz',
      priority: 'high',
      evidence: [
        `Nivel de estrés: ${stressLevel}`,
        `Afrontamiento: ${coping}`,
      ],
      pattern: 'stress',
    });
  }

  // Ansiedad
  if (data.anxiety_signs === true) {
    const symptoms = (data.anxiety_symptoms as string[]) || [];
    diagnoses.push({
      code: '00146',
      name: 'Ansiedad',
      nameEs: 'Ansiedad',
      priority: symptoms.length >= 3 ? 'high' : 'medium',
      evidence: [
        'Signos de ansiedad presentes',
        ...symptoms.map((s: string) => `Síntoma: ${s}`),
      ],
      pattern: 'stress',
    });
  }

  // Sin sistema de apoyo → Aislamiento Social
  if (data.support_system === false) {
    diagnoses.push({
      code: '00053',
      name: 'Aislamiento Social',
      nameEs: 'Aislamiento Social',
      priority: 'medium',
      evidence: ['Sin sistema de apoyo identificado'],
      pattern: 'stress',
    });
  }

  // Estrés severo
  if (stressLevel === 'severe') {
    diagnoses.push({
      code: '00177',
      name: 'Sobrecarga de Estrés',
      nameEs: 'Sobrecarga de Estrés',
      priority: 'high',
      evidence: ['Nivel de estrés: Severo'],
      pattern: 'stress',
    });
  }

  // Estado emocional alterado
  const emotional = data.emotional_state as string;
  if (emotional === 'sad') {
    diagnoses.push({
      code: '00124',
      name: 'Desesperanza',
      nameEs: 'Desesperanza',
      priority: 'medium',
      evidence: ['Estado emocional: Triste/Deprimido'],
      pattern: 'stress',
    });
  }

  if (emotional === 'fearful') {
    diagnoses.push({
      code: '00148',
      name: 'Temor',
      nameEs: 'Temor',
      priority: 'medium',
      evidence: ['Estado emocional: Temeroso'],
      pattern: 'stress',
    });
  }

  return diagnoses;
}

/**
 * Motor principal de evaluación NANDA
 * Evalúa todos los patrones proporcionados y retorna diagnósticos sugeridos
 */
export function evaluateNanda(allPatternData: Record<string, AssessmentData>): NandaDiagnosis[] {
  const allDiagnoses: NandaDiagnosis[] = [];

  if (allPatternData.nutritional) {
    allDiagnoses.push(...evaluateNutritional(allPatternData.nutritional));
  }
  if (allPatternData.sleep) {
    allDiagnoses.push(...evaluateSleep(allPatternData.sleep));
  }
  if (allPatternData.stress) {
    allDiagnoses.push(...evaluateStress(allPatternData.stress));
  }

  // Ordenar por prioridad
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  allDiagnoses.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return allDiagnoses;
}

/** Calcula el IMC y devuelve categoría */
export function getBMICategory(weight: number, height: number): {
  bmi: number;
  category: string;
  color: string;
} {
  const bmi = calculateBMI(weight, height);

  if (bmi < 18.5) return { bmi, category: 'Bajo peso', color: '#F59E0B' };
  if (bmi < 25) return { bmi, category: 'Normal', color: '#22C55E' };
  if (bmi < 30) return { bmi, category: 'Sobrepeso', color: '#F59E0B' };
  if (bmi < 35) return { bmi, category: 'Obesidad Grado I', color: '#EF4444' };
  if (bmi < 40) return { bmi, category: 'Obesidad Grado II', color: '#DC2626' };
  return { bmi, category: 'Obesidad Grado III', color: '#991B1B' };
}
