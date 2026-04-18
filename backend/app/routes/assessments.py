"""
Rutas de Valoraciones Clínicas con MongoDB
CRUD de valoraciones con motor NANDA automático
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.models.assessment import AssessmentCreate, AssessmentResponse, NandaSuggestion
from app.services.auth_service import get_current_user
from app.services.nanda_engine import evaluate_all_patterns
from app.database import get_assessments_collection

router = APIRouter()


def assessment_doc_to_response(doc: dict) -> AssessmentResponse:
    """Convierte documento MongoDB a AssessmentResponse"""
    return AssessmentResponse(
        id=str(doc["_id"]),
        patient_id=doc["patient_id"],
        nurse_id=doc["nurse_id"],
        date=doc.get("date", datetime.now(timezone.utc)),
        patterns=doc.get("patterns", {}),
        suggestions=[NandaSuggestion(**s) for s in doc.get("suggestions", [])],
        status=doc.get("status", "completed"),
        synced=doc.get("synced", True),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
    )


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(get_current_user),
):
    """Crear una nueva valoración clínica con evaluación NANDA automática"""
    assessments = get_assessments_collection()
    now = datetime.now(timezone.utc)

    # Motor de reglas NANDA
    suggestions = evaluate_all_patterns(assessment_data.patterns)

    doc = {
        "patient_id": assessment_data.patient_id,
        "nurse_id": current_user["user_id"],
        "date": now,
        "patterns": assessment_data.patterns,
        "suggestions": suggestions,
        "status": "completed",
        "synced": True,
        "created_at": now,
    }

    result = await assessments.insert_one(doc)
    doc["_id"] = result.inserted_id

    return assessment_doc_to_response(doc)


@router.get("/", response_model=list[AssessmentResponse])
async def get_assessments(
    patient_id: Optional[str] = Query(None, description="Filtrar por paciente"),
    current_user: dict = Depends(get_current_user),
):
    """Obtener lista de valoraciones, opcionalmente filtradas por paciente"""
    assessments = get_assessments_collection()

    query = {}
    if patient_id:
        query["patient_id"] = patient_id

    # Solo las valoraciones del enfermero autenticado
    query["nurse_id"] = current_user["user_id"]

    cursor = assessments.find(query).sort("date", -1)
    results = []
    async for doc in cursor:
        results.append(assessment_doc_to_response(doc))

    return results


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Obtener una valoración por ID"""
    assessments = get_assessments_collection()

    try:
        doc = await assessments.find_one({"_id": ObjectId(assessment_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración no encontrada",
        )

    return assessment_doc_to_response(doc)


@router.post("/evaluate", response_model=list[NandaSuggestion])
async def evaluate_patterns(
    patterns: dict,
    current_user: dict = Depends(get_current_user),
):
    """Evaluar patrones sin guardar (sugerencias en tiempo real)"""
    suggestions = evaluate_all_patterns(patterns)
    return [NandaSuggestion(**s) for s in suggestions]


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Eliminar una valoración"""
    assessments = get_assessments_collection()

    try:
        result = await assessments.delete_one({"_id": ObjectId(assessment_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valoración no encontrada")
