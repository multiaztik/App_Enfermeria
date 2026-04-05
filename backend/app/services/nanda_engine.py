"""
Motor de Reglas NANDA-I (Backend)
Evalúa los datos de los patrones y sugiere diagnósticos NANDA
"""
from typing import Any


def calculate_bmi(weight: float, height: float) -> float:
    """Calcula el Índice de Masa Corporal"""
    if not weight or not height or height == 0:
        return 0
    return weight / (height ** 2)


def evaluate_nutritional(data: dict[str, Any]) -> list[dict]:
    """Reglas para Patrón Nutricional-Metabólico"""
    diagnoses = []
    weight = data.get("weight", 0)
    height = data.get("height", 0)
    bmi = calculate_bmi(weight, height)

    if bmi > 0 and bmi < 18.5:
        diagnoses.append({
            "nanda_code": "00002",
            "diagnosis": "Desequilibrio Nutricional: Inferior a las Necesidades",
            "priority": "high",
            "evidence": [f"IMC: {bmi:.1f} (< 18.5)"]
        })

    if bmi >= 30:
        diagnoses.append({
            "nanda_code": "00001",
            "diagnosis": "Desequilibrio Nutricional: Superior a las Necesidades",
            "priority": "high" if bmi >= 35 else "medium",
            "evidence": [f"IMC: {bmi:.1f} (≥ 30)"]
        })

    if data.get("swallowing_difficulty"):
        diagnoses.append({
            "nanda_code": "00103",
            "diagnosis": "Deterioro de la Deglución",
            "priority": "high",
            "evidence": ["Dificultad para deglutir presente"]
        })

    if data.get("skin_lesions"):
        diagnoses.append({
            "nanda_code": "00046",
            "diagnosis": "Deterioro de la Integridad Cutánea",
            "priority": "high" if "pressure_ulcer" in data.get("lesion_type", []) else "medium",
            "evidence": ["Lesiones en piel activas"]
        })

    if data.get("oral_condition") and data["oral_condition"] != "normal":
        diagnoses.append({
            "nanda_code": "00045",
            "diagnosis": "Deterioro de la Integridad de la Mucosa Oral",
            "priority": "medium",
            "evidence": [f"Mucosa oral: {data['oral_condition']}"]
        })

    if data.get("edema_present"):
        diagnoses.append({
            "nanda_code": "00026",
            "diagnosis": "Exceso de Volumen de Líquidos",
            "priority": "medium",
            "evidence": ["Edema presente"]
        })

    glucose = data.get("glucose", 0)
    if glucose and glucose > 126:
        diagnoses.append({
            "nanda_code": "00179",
            "diagnosis": "Riesgo de Nivel de Glucemia Inestable",
            "priority": "high" if glucose > 200 else "medium",
            "evidence": [f"Glucosa: {glucose} mg/dL (> 126)"]
        })

    return diagnoses


def evaluate_sleep(data: dict[str, Any]) -> list[dict]:
    """Reglas para Patrón Sueño-Descanso"""
    diagnoses = []

    if data.get("sleep_normal"):
        return diagnoses

    insomnia = data.get("insomnia", "none")
    if insomnia and insomnia != "none":
        diagnoses.append({
            "nanda_code": "00095",
            "diagnosis": "Insomnio",
            "priority": "high",
            "evidence": [f"Tipo de insomnio: {insomnia}"]
        })

    hours = data.get("hours_sleep", 8)
    quality = data.get("sleep_quality", "")
    if hours and hours < 6 and quality == "poor":
        diagnoses.append({
            "nanda_code": "00096",
            "diagnosis": "Deprivación de Sueño",
            "priority": "high",
            "evidence": [f"Horas de sueño: {hours}", "Calidad: Mala"]
        })

    fatigue = data.get("fatigue_level", 0)
    if fatigue and fatigue >= 7:
        diagnoses.append({
            "nanda_code": "00093",
            "diagnosis": "Fatiga",
            "priority": "high" if fatigue >= 9 else "medium",
            "evidence": [f"Nivel de fatiga: {fatigue}/10"]
        })

    return diagnoses


def evaluate_stress(data: dict[str, Any]) -> list[dict]:
    """Reglas para Patrón Tolerancia al Estrés"""
    diagnoses = []

    stress_level = data.get("stress_level", "low")
    coping = data.get("coping_strategy", "adequate")

    if stress_level in ("high", "severe") and coping in ("inadequate", "absent"):
        diagnoses.append({
            "nanda_code": "00069",
            "diagnosis": "Afrontamiento Ineficaz",
            "priority": "high",
            "evidence": [f"Estrés: {stress_level}", f"Afrontamiento: {coping}"]
        })

    if data.get("anxiety_signs"):
        symptoms = data.get("anxiety_symptoms", [])
        diagnoses.append({
            "nanda_code": "00146",
            "diagnosis": "Ansiedad",
            "priority": "high" if len(symptoms) >= 3 else "medium",
            "evidence": ["Signos de ansiedad presentes"] + [f"Síntoma: {s}" for s in symptoms]
        })

    if data.get("support_system") is False:
        diagnoses.append({
            "nanda_code": "00053",
            "diagnosis": "Aislamiento Social",
            "priority": "medium",
            "evidence": ["Sin sistema de apoyo"]
        })

    if stress_level == "severe":
        diagnoses.append({
            "nanda_code": "00177",
            "diagnosis": "Sobrecarga de Estrés",
            "priority": "high",
            "evidence": ["Nivel de estrés: Severo"]
        })

    return diagnoses


def evaluate_all_patterns(patterns: dict[str, dict[str, Any]]) -> list[dict]:
    """Evalúa todos los patrones y retorna diagnósticos ordenados por prioridad"""
    all_diagnoses = []

    if "nutritional" in patterns:
        all_diagnoses.extend(evaluate_nutritional(patterns["nutritional"]))
    if "sleep" in patterns:
        all_diagnoses.extend(evaluate_sleep(patterns["sleep"]))
    if "stress" in patterns:
        all_diagnoses.extend(evaluate_stress(patterns["stress"]))

    # Ordenar por prioridad
    priority_order = {"high": 0, "medium": 1, "low": 2}
    all_diagnoses.sort(key=lambda d: priority_order.get(d["priority"], 3))

    return all_diagnoses
