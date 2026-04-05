"""
Pruebas unitarias para el Motor de Reglas NANDA
Cumple con requisito de la materia de Pruebas y Mantenimiento
"""
import pytest
from app.services.nanda_engine import (
    calculate_bmi,
    evaluate_nutritional,
    evaluate_sleep,
    evaluate_stress,
    evaluate_all_patterns,
)


class TestCalculateBMI:
    """Pruebas para cálculo de IMC"""

    def test_bmi_normal(self):
        """IMC normal (18.5-24.9)"""
        bmi = calculate_bmi(70, 1.75)
        assert 18.5 <= bmi <= 24.9

    def test_bmi_bajo_peso(self):
        """IMC bajo peso (<18.5)"""
        bmi = calculate_bmi(45, 1.70)
        assert bmi < 18.5

    def test_bmi_obesidad(self):
        """IMC obesidad (≥30)"""
        bmi = calculate_bmi(100, 1.65)
        assert bmi >= 30

    def test_bmi_cero_height(self):
        """Talla cero no debe causar error"""
        bmi = calculate_bmi(70, 0)
        assert bmi == 0

    def test_bmi_valores_nulos(self):
        """Valores nulos retornan 0"""
        bmi = calculate_bmi(0, 0)
        assert bmi == 0


class TestEvaluateNutritional:
    """Pruebas para evaluación del patrón Nutricional-Metabólico"""

    def test_bajo_peso_detectado(self):
        """HU-03: Si IMC < 18.5, debe detectar desnutrición"""
        data = {"weight": 45, "height": 1.70}
        diagnoses = evaluate_nutritional(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00002" in codes  # Desequilibrio Nutricional

    def test_obesidad_detectada(self):
        """IMC ≥ 30 debe detectar nutrición excesiva"""
        data = {"weight": 100, "height": 1.65}
        diagnoses = evaluate_nutritional(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00001" in codes

    def test_disfagia_detectada(self):
        """Dificultad para deglutir genera diagnóstico"""
        data = {"weight": 70, "height": 1.70, "swallowing_difficulty": True}
        diagnoses = evaluate_nutritional(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00103" in codes

    def test_lesiones_piel(self):
        """Lesiones en piel generan diagnóstico"""
        data = {"weight": 70, "height": 1.70, "skin_lesions": True, "lesion_type": ["pressure_ulcer"]}
        diagnoses = evaluate_nutritional(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00046" in codes
        # Úlcera por presión debe ser prioridad alta
        for d in diagnoses:
            if d["nanda_code"] == "00046":
                assert d["priority"] == "high"

    def test_glucosa_elevada(self):
        """Glucosa > 126 genera alerta"""
        data = {"weight": 70, "height": 1.70, "glucose": 250}
        diagnoses = evaluate_nutritional(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00179" in codes
        # Glucosa > 200 debe ser prioridad alta
        for d in diagnoses:
            if d["nanda_code"] == "00179":
                assert d["priority"] == "high"

    def test_paciente_sano(self):
        """Paciente sin alteraciones no genera diagnósticos innecesarios"""
        data = {"weight": 70, "height": 1.75, "oral_condition": "normal"}
        diagnoses = evaluate_nutritional(data)
        # Solo se esperan diagnósticos si hay hallazgos
        critical = [d for d in diagnoses if d["priority"] == "high"]
        assert len(critical) == 0


class TestEvaluateSleep:
    """Pruebas para evaluación del patrón Sueño-Descanso"""

    def test_sueno_normal_sin_diagnosticos(self):
        """HU-02: Si marca 'sin alteraciones', no genera diagnósticos"""
        data = {"sleep_normal": True}
        diagnoses = evaluate_sleep(data)
        assert len(diagnoses) == 0

    def test_insomnio_detectado(self):
        """Insomnio presente genera diagnóstico"""
        data = {"sleep_normal": False, "insomnia": "onset"}
        diagnoses = evaluate_sleep(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00095" in codes

    def test_deprivacion_sueno(self):
        """Menos de 6 horas + calidad mala = deprivación"""
        data = {"sleep_normal": False, "hours_sleep": 4, "sleep_quality": "poor"}
        diagnoses = evaluate_sleep(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00096" in codes

    def test_fatiga_severa(self):
        """Fatiga ≥ 9 genera prioridad alta"""
        data = {"sleep_normal": False, "fatigue_level": 9}
        diagnoses = evaluate_sleep(data)
        fatigue_diag = [d for d in diagnoses if d["nanda_code"] == "00093"]
        assert len(fatigue_diag) > 0
        assert fatigue_diag[0]["priority"] == "high"


class TestEvaluateStress:
    """Pruebas para evaluación del patrón Tolerancia al Estrés"""

    def test_afrontamiento_ineficaz(self):
        """Estrés alto + afrontamiento inadecuado"""
        data = {"stress_level": "high", "coping_strategy": "inadequate"}
        diagnoses = evaluate_stress(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00069" in codes

    def test_ansiedad_detectada(self):
        """Signos de ansiedad generan diagnóstico"""
        data = {
            "stress_level": "moderate",
            "coping_strategy": "adequate",
            "anxiety_signs": True,
            "anxiety_symptoms": ["tachycardia", "diaphoresis", "tremor"],
        }
        diagnoses = evaluate_stress(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00146" in codes
        # Tres o más síntomas = prioridad alta
        for d in diagnoses:
            if d["nanda_code"] == "00146":
                assert d["priority"] == "high"

    def test_aislamiento_social(self):
        """Sin sistema de apoyo genera aislamiento social"""
        data = {
            "stress_level": "moderate",
            "coping_strategy": "adequate",
            "support_system": False,
        }
        diagnoses = evaluate_stress(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00053" in codes

    def test_sobrecarga_estres(self):
        """Estrés severo genera sobrecarga"""
        data = {"stress_level": "severe", "coping_strategy": "adequate"}
        diagnoses = evaluate_stress(data)
        codes = [d["nanda_code"] for d in diagnoses]
        assert "00177" in codes


class TestEvaluateAllPatterns:
    """Pruebas de integración del motor completo"""

    def test_multiples_patrones(self):
        """Evaluar múltiples patrones simultáneamente"""
        patterns = {
            "nutritional": {"weight": 45, "height": 1.70, "glucose": 300},
            "sleep": {"sleep_normal": False, "hours_sleep": 3, "sleep_quality": "poor"},
            "stress": {"stress_level": "severe", "coping_strategy": "absent", "anxiety_signs": True},
        }
        diagnoses = evaluate_all_patterns(patterns)
        assert len(diagnoses) > 0
        # Verificar que están ordenados por prioridad
        priorities = [d["priority"] for d in diagnoses]
        high_indices = [i for i, p in enumerate(priorities) if p == "high"]
        medium_indices = [i for i, p in enumerate(priorities) if p == "medium"]
        if high_indices and medium_indices:
            assert max(high_indices) < min(medium_indices)

    def test_sin_patrones(self):
        """Sin patrones no genera diagnósticos"""
        diagnoses = evaluate_all_patterns({})
        assert len(diagnoses) == 0

    def test_patron_parcial(self):
        """Evaluar solo un patrón"""
        patterns = {"nutritional": {"weight": 100, "height": 1.60}}
        diagnoses = evaluate_all_patterns(patterns)
        assert len(diagnoses) > 0
        # Todos deben ser del patrón nutricional
        for d in diagnoses:
            assert "Nutricional" in d["diagnosis"] or "IMC" in str(d["evidence"])
