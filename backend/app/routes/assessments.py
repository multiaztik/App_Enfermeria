"""
Rutas de Valoraciones Clínicas
CRUD de valoraciones con evaluación NANDA automática
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import Optional
from app.models.assessment import AssessmentCreate, AssessmentResponse, AssessmentUpdate, NandaSuggestion
from app.services.auth_service import get_current_user
from app.services.nanda_engine import evaluate_all_patterns

router = APIRouter()

# Almacén temporal en memoria
assessments_db: dict[str, dict] = {}


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(get_current_user),
):
    """Crear una nueva valoración clínica con evaluación NANDA automática"""
    assessment_id = f"assess-{len(assessments_db) + 1}-{int(datetime.now().timestamp())}"
    now = datetime.now(timezone.utc)
    
    # Ejecutar motor de reglas NANDA
    suggestions = evaluate_all_patterns(assessment_data.patterns)
    
    assessment = {
        "id": assessment_id,
        "patient_id": assessment_data.patient_id,
        "nurse_id": current_user["user_id"],
        "date": now,
        "patterns": assessment_data.patterns,
        "suggestions": suggestions,
        "status": "completed",
        "synced": True,
        "created_at": now,
    }
    
    assessments_db[assessment_id] = assessment
    
    return AssessmentResponse(
        id=assessment_id,
        patient_id=assessment_data.patient_id,
        nurse_id=current_user["user_id"],
        date=now,
        patterns=assessment_data.patterns,
        suggestions=[NandaSuggestion(**s) for s in suggestions],
        status="completed",
        synced=True,
        created_at=now,
    )


@router.get("/", response_model=list[AssessmentResponse])
async def get_assessments(
    patient_id: Optional[str] = Query(None, description="Filtrar por paciente"),
    current_user: dict = Depends(get_current_user),
):
    """Obtener lista de valoraciones, opcionalmente filtradas por paciente"""
    results = []
    for assessment in assessments_db.values():
        if patient_id and assessment["patient_id"] != patient_id:
            continue
        results.append(AssessmentResponse(
            id=assessment["id"],
            patient_id=assessment["patient_id"],
            nurse_id=assessment["nurse_id"],
            date=assessment["date"],
            patterns=assessment["patterns"],
            suggestions=[NandaSuggestion(**s) for s in assessment["suggestions"]],
            status=assessment["status"],
            synced=assessment["synced"],
            created_at=assessment["created_at"],
        ))
    return results


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Obtener una valoración por ID"""
    assessment = assessments_db.get(assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada",
        )
    return AssessmentResponse(
        id=assessment["id"],
        patient_id=assessment["patient_id"],
        nurse_id=assessment["nurse_id"],
        date=assessment["date"],
        patterns=assessment["patterns"],
        suggestions=[NandaSuggestion(**s) for s in assessment["suggestions"]],
        status=assessment["status"],
        synced=assessment["synced"],
        created_at=assessment["created_at"],
    )


@router.post("/evaluate", response_model=list[NandaSuggestion])
async def evaluate_patterns(
    patterns: dict,
    current_user: dict = Depends(get_current_user),
):
    """Evaluar patrones sin guardar (endpoint para sugerencias en tiempo real)"""
    suggestions = evaluate_all_patterns(patterns)
    return [NandaSuggestion(**s) for s in suggestions]
