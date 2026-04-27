/**
 * Motor de Reglas NANDA-I para Sugerencias Diagnósticas
 * Implementa reglas booleanas para los 11 patrones de Gordon
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

/** Calcula el IMC a partir de peso (kg) y talla en cm (se convierte a m internamente) */
function calculateBMI(weight: number, heightCm: number): number {
  if (!weight || !heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
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

/** Reglas para el Patrón Percepción-Manejo de Salud */
function evaluatePerception(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Percepción de salud mala + no sigue tratamiento
  if (data.health_perception === 'poor' && data.follows_treatment === false) {
    diagnoses.push({
      code: '00078',
      name: 'Gestión Ineficaz de la Salud',
      nameEs: 'Gestión Ineficaz de la Salud',
      priority: 'high',
      evidence: ['Percepción de salud: Mala', 'No sigue indicaciones médicas'],
      pattern: 'perception',
    });
  }

  // Adherencia parcial o nula
  if (data.treatment_adherence === 'partial' || data.treatment_adherence === 'none') {
    diagnoses.push({
      code: '00079',
      name: 'Incumplimiento del Tratamiento',
      nameEs: 'Incumplimiento del Tratamiento',
      priority: data.treatment_adherence === 'none' ? 'high' : 'medium',
      evidence: [`Adherencia al tratamiento: ${data.treatment_adherence}`],
      pattern: 'perception',
    });
  }

  // Consumo de sustancias nocivas
  const substances = (data.substance_use as string[]) || [];
  const harmfulSubstances = substances.filter(s => s !== 'none');
  if (harmfulSubstances.length > 0) {
    diagnoses.push({
      code: '00188',
      name: 'Tendencia a Adoptar Conductas de Riesgo para la Salud',
      nameEs: 'Tendencia a Adoptar Conductas de Riesgo para la Salud',
      priority: harmfulSubstances.includes('drugs') ? 'high' : 'medium',
      evidence: harmfulSubstances.map(s => `Consumo de: ${s}`),
      pattern: 'perception',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Eliminación */
function evaluateElimination(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Síntomas urinarios
  const urinarySymptoms = (data.urinary_symptoms as string[]) || [];
  if (urinarySymptoms.includes('incontinence')) {
    diagnoses.push({
      code: '00017',
      name: 'Incontinencia Urinaria de Esfuerzo',
      nameEs: 'Incontinencia Urinaria de Esfuerzo',
      priority: 'high',
      evidence: ['Incontinencia urinaria presente'],
      pattern: 'elimination',
    });
  }
  if (urinarySymptoms.includes('retention')) {
    diagnoses.push({
      code: '00023',
      name: 'Retención Urinaria',
      nameEs: 'Retención Urinaria',
      priority: 'high',
      evidence: ['Retención urinaria presente'],
      pattern: 'elimination',
    });
  }

  // Síntomas intestinales
  const bowelSymptoms = (data.bowel_symptoms as string[]) || [];
  if (bowelSymptoms.includes('constipation') || data.stool_consistency === 'hard') {
    diagnoses.push({
      code: '00011',
      name: 'Estreñimiento',
      nameEs: 'Estreñimiento',
      priority: 'medium',
      evidence: ['Estreñimiento presente'],
      pattern: 'elimination',
    });
  }
  if (bowelSymptoms.includes('diarrhea') || data.stool_consistency === 'liquid') {
    diagnoses.push({
      code: '00013',
      name: 'Diarrea',
      nameEs: 'Diarrea',
      priority: 'medium',
      evidence: ['Diarrea presente'],
      pattern: 'elimination',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Actividad-Ejercicio */
function evaluateActivity(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Movilidad reducida
  if (data.mobility_level === 'total_help' || data.mobility_level === 'bedridden') {
    diagnoses.push({
      code: '00085',
      name: 'Deterioro de la Movilidad Física',
      nameEs: 'Deterioro de la Movilidad Física',
      priority: 'high',
      evidence: [`Nivel de movilidad: ${data.mobility_level}`],
      pattern: 'activity',
    });
  }

  // Disnea
  if (data.dyspnea === true) {
    diagnoses.push({
      code: '00032',
      name: 'Patrón Respiratorio Ineficaz',
      nameEs: 'Patrón Respiratorio Ineficaz',
      priority: data.dyspnea_type === 'rest' ? 'high' : 'medium',
      evidence: [
        'Disnea presente',
        data.dyspnea_type ? `Tipo: ${data.dyspnea_type}` : '',
      ].filter(Boolean),
      pattern: 'activity',
    });
  }

  // Saturación baja
  const spo2 = data.oxygen_saturation as number;
  if (spo2 && spo2 < 92) {
    diagnoses.push({
      code: '00030',
      name: 'Deterioro del Intercambio Gaseoso',
      nameEs: 'Deterioro del Intercambio Gaseoso',
      priority: spo2 < 88 ? 'high' : 'medium',
      evidence: [`SpO2: ${spo2}% (< 92%)`],
      pattern: 'activity',
    });
  }

  // Déficit de autocuidado
  if (data.self_care_deficit === true) {
    const areas = (data.self_care_areas as string[]) || [];
    diagnoses.push({
      code: '00108',
      name: 'Déficit de Autocuidado',
      nameEs: 'Déficit de Autocuidado',
      priority: areas.length >= 3 ? 'high' : 'medium',
      evidence: [
        'Déficit de autocuidado presente',
        ...areas.map(a => `Área: ${a}`),
      ],
      pattern: 'activity',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Cognitivo-Perceptual */
function evaluateCognitive(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Dolor
  if (data.pain_present === true) {
    const painLevel = data.pain_level as number;
    diagnoses.push({
      code: data.pain_type === 'chronic' ? '00133' : '00132',
      name: data.pain_type === 'chronic' ? 'Dolor Crónico' : 'Dolor Agudo',
      nameEs: data.pain_type === 'chronic' ? 'Dolor Crónico' : 'Dolor Agudo',
      priority: painLevel && painLevel >= 7 ? 'high' : 'medium',
      evidence: [
        'Dolor presente',
        painLevel ? `EVA: ${painLevel}/10` : '',
        data.pain_location ? `Localización: ${data.pain_location}` : '',
      ].filter(Boolean),
      pattern: 'cognitive',
    });
  }

  // Nivel de conciencia alterado
  if (data.consciousness_level && data.consciousness_level !== 'alert') {
    diagnoses.push({
      code: '00128',
      name: 'Confusión Aguda',
      nameEs: 'Confusión Aguda',
      priority: data.consciousness_level === 'unconscious' ? 'high' : 'medium',
      evidence: [`Nivel de conciencia: ${data.consciousness_level}`],
      pattern: 'cognitive',
    });
  }

  // Alteración comunicación
  if (data.communication_ability && data.communication_ability !== 'normal') {
    diagnoses.push({
      code: '00051',
      name: 'Deterioro de la Comunicación Verbal',
      nameEs: 'Deterioro de la Comunicación Verbal',
      priority: data.communication_ability === 'non_verbal' ? 'high' : 'medium',
      evidence: [`Comunicación: ${data.communication_ability}`],
      pattern: 'cognitive',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Autopercepción-Autoconcepto */
function evaluateSelfPerception(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Autoestima baja
  if (data.self_esteem === 'low' || data.self_esteem === 'very_low') {
    diagnoses.push({
      code: '00119',
      name: 'Baja Autoestima Crónica',
      nameEs: 'Baja Autoestima Crónica',
      priority: data.self_esteem === 'very_low' ? 'high' : 'medium',
      evidence: [`Autoestima: ${data.self_esteem}`],
      pattern: 'self_perception',
    });
  }

  // Alteración de imagen corporal
  if (data.body_image_disturbance === true) {
    diagnoses.push({
      code: '00118',
      name: 'Trastorno de la Imagen Corporal',
      nameEs: 'Trastorno de la Imagen Corporal',
      priority: 'medium',
      evidence: ['Alteración de la imagen corporal presente'],
      pattern: 'self_perception',
    });
  }

  // Desesperanza
  if (data.expresses_hopelessness === true) {
    diagnoses.push({
      code: '00124',
      name: 'Desesperanza',
      nameEs: 'Desesperanza',
      priority: 'high',
      evidence: ['Expresa sentimientos de desesperanza'],
      pattern: 'self_perception',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Rol-Relaciones */
function evaluateRole(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  // Aislamiento social
  if (data.social_isolation === true) {
    diagnoses.push({
      code: '00053',
      name: 'Aislamiento Social',
      nameEs: 'Aislamiento Social',
      priority: 'medium',
      evidence: ['Se siente aislado socialmente'],
      pattern: 'role',
    });
  }

  // Violencia doméstica
  if (data.domestic_violence === true) {
    diagnoses.push({
      code: '00138',
      name: 'Riesgo de Violencia Dirigida a Otros',
      nameEs: 'Riesgo de Violencia Dirigida a Otros',
      priority: 'high',
      evidence: ['Indicios de violencia doméstica'],
      pattern: 'role',
    });
  }

  // Cambios en rol familiar
  if (data.role_changes === true && data.interpersonal_conflicts === true) {
    diagnoses.push({
      code: '00064',
      name: 'Conflicto del Rol Parental',
      nameEs: 'Conflicto del Rol Parental',
      priority: 'medium',
      evidence: ['Cambios de rol recientes', 'Conflictos interpersonales presentes'],
      pattern: 'role',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Sexualidad-Reproducción */
function evaluateSexuality(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  if (data.sexual_concerns === true) {
    const concerns = (data.sexual_concern_type as string[]) || [];
    diagnoses.push({
      code: '00059',
      name: 'Disfunción Sexual',
      nameEs: 'Disfunción Sexual',
      priority: 'medium',
      evidence: [
        'Preocupaciones sexuales presentes',
        ...concerns.map(c => `Tipo: ${c}`),
      ],
      pattern: 'sexuality',
    });
  }

  return diagnoses;
}

/** Reglas para el Patrón Valores-Creencias */
function evaluateValues(data: AssessmentData): NandaDiagnosis[] {
  const diagnoses: NandaDiagnosis[] = [];

  if (data.spiritual_distress === true) {
    diagnoses.push({
      code: '00066',
      name: 'Sufrimiento Espiritual',
      nameEs: 'Sufrimiento Espiritual',
      priority: 'medium',
      evidence: ['Sufrimiento espiritual expresado'],
      pattern: 'values',
    });
  }

  if (data.treatment_beliefs === true) {
    diagnoses.push({
      code: '00083',
      name: 'Conflicto de Decisiones',
      nameEs: 'Conflicto de Decisiones',
      priority: 'medium',
      evidence: [
        'Las creencias afectan el tratamiento',
        data.treatment_beliefs_detail ? `Detalle: ${data.treatment_beliefs_detail}` : '',
      ].filter(Boolean),
      pattern: 'values',
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
  if (allPatternData.perception) {
    allDiagnoses.push(...evaluatePerception(allPatternData.perception));
  }
  if (allPatternData.elimination) {
    allDiagnoses.push(...evaluateElimination(allPatternData.elimination));
  }
  if (allPatternData.activity) {
    allDiagnoses.push(...evaluateActivity(allPatternData.activity));
  }
  if (allPatternData.cognitive) {
    allDiagnoses.push(...evaluateCognitive(allPatternData.cognitive));
  }
  if (allPatternData.self_perception) {
    allDiagnoses.push(...evaluateSelfPerception(allPatternData.self_perception));
  }
  if (allPatternData.role) {
    allDiagnoses.push(...evaluateRole(allPatternData.role));
  }
  if (allPatternData.sexuality) {
    allDiagnoses.push(...evaluateSexuality(allPatternData.sexuality));
  }
  if (allPatternData.values) {
    allDiagnoses.push(...evaluateValues(allPatternData.values));
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
