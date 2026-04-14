# BitCare — NurseAssess

> Sistema de valoración clínica para enfermería basado en los **Patrones de Gordon**.
> Aplicación móvil + web construida con React Native (Expo) y FastAPI + MongoDB.

---

## 📱 Características

- **Login y registro real** de enfermeros con JWT y contraseñas hasheadas (bcrypt)
- **Directorio de pacientes** con búsqueda, filtros y CRUD completo (crear, editar, eliminar)
- **Valoraciones clínicas** en 3 patrones de Gordon (MVP):
  - Nutricional-Metabólico
  - Sueño-Descanso
  - Tolerancia al Estrés
- **Motor NANDA-I** para sugerencias diagnósticas automáticas
- **Mapa corporal interactivo** para localizar síntomas/dolor
- Funciona en **web y dispositivos móviles** en la misma red local
- **Sin escáner QR** — los pacientes se identifican por ID generado automáticamente

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React Native · Expo SDK 54 · Expo Router |
| Backend | FastAPI (Python 3.14) · Uvicorn |
| Base de datos | MongoDB · Motor (AsyncIO) |
| Auth | JWT (python-jose) · bcrypt |
| Diseño | Sistema "BitCare" — minimalista B&W |

---

## 🚀 Levantar el proyecto

### Requisitos
- Python 3.10+
- Node.js 18+
- MongoDB corriendo localmente en `mongodb://localhost:27017`

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

La API estará disponible en:
- `http://localhost:8000` — API
- `http://localhost:8000/docs` — Swagger UI

### Frontend

```bash
cd frontend
npm install
npx expo start --web --port 8082
```

Accede desde el navegador en `http://localhost:8082`
o desde tu celular en `http://<IP-de-tu-PC>:8082`

---

## 🗂 Estructura del proyecto

```
App_Enfermeria/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI + lifespan MongoDB
│       ├── database.py          # Conexión Motor AsyncIO
│       ├── config.py            # Variables de entorno
│       ├── models/              # Modelos Pydantic
│       ├── routes/              # auth, patients, assessments
│       └── services/            # JWT + bcrypt
│
└── frontend/
    └── app/
        ├── login.tsx            # Pantalla de inicio de sesión
        ├── register.tsx         # Registro de enfermero
        ├── (tabs)/
        │   ├── home.tsx         # Dashboard principal
        │   ├── patients.tsx     # Directorio + CRUD de pacientes
        │   ├── history.tsx      # Historial de valoraciones
        │   └── profile.tsx      # Perfil + cerrar sesión
        ├── patients/
        │   ├── new.tsx          # Formulario de nuevo paciente
        │   └── [id]/edit.tsx    # Editar/eliminar paciente
        └── assessment/
            └── [patientId].tsx  # Formulario de valoración clínica
```

---

## 🔐 Seguridad

- Las contraseñas se hashean con `bcrypt` antes de guardar en MongoDB
- Los endpoints de API requieren **Bearer token JWT** (excepto `/login` y `/register`)
- Los tokens expiran según `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30 min)

---

## 🏥 Patrones de Gordon implementados (MVP)

| # | Patrón | Campos principales |
|---|--------|-------------------|
| 1 | Nutricional-Metabólico | Peso, talla, IMC, apetito, edema, piel, mucosas |
| 2 | Sueño-Descanso | Horas de sueño, calidad, insomnio, medicación |
| 3 | Tolerancia al Estrés | Nivel de estrés, estrategias, soporte social |

Los patrones restantes (Percepción, Eliminación, Actividad, etc.) están marcados como **Próximamente**.

---

## ⚙️ Variables de entorno (backend)

Crea un archivo `.env` en `/backend`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nurse_assess
JWT_SECRET_KEY=tu-clave-secreta-muy-larga
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
```

---

## 📝 Notas de desarrollo

- ~~Escáner de código QR~~ — **Eliminado** en favor de IDs generados automáticamente (`PAC-XXXXXX`)
- El backend usa `motor` (Motor AsyncIO) en lugar de PyMongo para compatibilidad con async/await de FastAPI
- `passlib` fue reemplazado por `bcrypt` directo por incompatibilidad con Python 3.14
- Los datos mock de pacientes se usan como **fallback** si el backend no está disponible

---

## 👥 Créditos

Desarrollado para prácticas clínicas de enfermería — UAZ
Sistema de diseño: **BitCare** (minimalista, clínico, B&W)
