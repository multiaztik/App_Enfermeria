"""
Rutas de Pacientes con MongoDB
CRUD completo de pacientes
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.models.patient import PatientCreate, PatientResponse, PersonalData
from app.services.auth_service import get_current_user
from app.database import get_patients_collection

router = APIRouter()


def patient_doc_to_response(doc: dict) -> PatientResponse:
    """Convierte documento MongoDB a PatientResponse"""
    return PatientResponse(
        id=str(doc["_id"]),
        qr_code=doc.get("qr_code", f"PAC-{str(doc['_id'])[:8].upper()}"),
        personal_data=PersonalData(**doc["personal_data"]),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at", datetime.now(timezone.utc)),
    )


@router.get("/", response_model=list[PatientResponse])
async def get_patients(
    search: Optional[str] = Query(None, description="Buscar por nombre"),
    current_user: dict = Depends(get_current_user),
):
    """Obtener lista de pacientes con búsqueda opcional"""
    patients = get_patients_collection()

    query = {}
    if search:
        query["personal_data.nombre"] = {"$regex": search, "$options": "i"}

    cursor = patients.find(query).sort("personal_data.nombre", 1)
    results = []
    async for doc in cursor:
        results.append(patient_doc_to_response(doc))

    return results


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Obtener paciente por ID"""
    patients = get_patients_collection()

    try:
        doc = await patients.find_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )

    return patient_doc_to_response(doc)


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient: PatientCreate,
    current_user: dict = Depends(get_current_user),
):
    """Crear un nuevo paciente"""
    patients = get_patients_collection()
    now = datetime.now(timezone.utc)

    doc = {
        "qr_code": patient.qr_code,
        "personal_data": patient.personal_data.model_dump(),
        "created_by": current_user["user_id"],
        "created_at": now,
        "updated_at": now,
    }

    result = await patients.insert_one(doc)
    doc["_id"] = result.inserted_id

    return patient_doc_to_response(doc)


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: dict,
    current_user: dict = Depends(get_current_user),
):
    """Actualizar datos de un paciente"""
    patients = get_patients_collection()

    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    now = datetime.now(timezone.utc)
    update_data = {k: v for k, v in patient_update.items() if k not in ["_id", "id"]}
    update_data["updated_at"] = now

    result = await patients.update_one({"_id": oid}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")

    doc = await patients.find_one({"_id": oid})
    return patient_doc_to_response(doc)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Eliminar un paciente"""
    patients = get_patients_collection()

    try:
        result = await patients.delete_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado")
