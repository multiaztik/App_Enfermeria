# 🩺 NurseAssess — App de Valoración Clínica de Enfermería

Aplicación móvil multiplataforma para la automatización de valoraciones clínicas basadas en los **Patrones Funcionales de Gordon**, con motor de inferencia para sugerencias diagnósticas **NANDA-I**.

## 📱 Características Principales

### MVP (3 Patrones)
- **🍎 Nutricional-Metabólico** — Cálculo de IMC, estado de piel, mucosa oral, glucosa, edemas
- **🌙 Sueño-Descanso** — Calidad del sueño, insomnio, fatiga diurna, factores ambientales
- **🧠 Tolerancia al Estrés** — Nivel de estrés, afrontamiento, ansiedad, sistema de apoyo

### Funcionalidades
- 📷 **Escaneo QR** — Vinculación de pacientes por código QR (RF-01)
- 🔀 **Saltos Lógicos** — Renderizado condicional de preguntas (RF-02)
- 👆 **Interfaz de Un Solo Toque** — Toggles, sliders y selectores (RF-03)
- 🩺 **Motor NANDA** — Sugerencias diagnósticas en tiempo real (RF-06)
- 📴 **Modo Offline** — Almacenamiento local con sincronización posterior (RNF-04)
- 🔐 **Autenticación JWT** — Login seguro para personal de enfermería (RNF-03)

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────┐
│           React Native (Expo SDK 54)          │
│         Capa de Presentación                  │
│  • Expo Router  • Context API  • TypeScript   │
└──────────────┬───────────────────────────────┘
               │ HTTPS / JSON
┌──────────────▼───────────────────────────────┐
│            FastAPI (Python 3.11+)             │
│          Capa de Aplicación                   │
│  • Pydantic  • Motor NANDA  • JWT Auth       │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│           MongoDB Atlas (NoSQL)               │
│            Capa de Datos                      │
│  • Documento único por paciente               │
└──────────────────────────────────────────────┘
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** 18+ (recomendado 20+)
- **Python** 3.11+
- **Expo Go** en tu dispositivo móvil (opcional, para pruebas en dispositivo)

### Frontend (React Native)

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start

# Para abrir en web (desarrollo)
npx expo start --web

# Para abrir en dispositivo
# Escanea el QR con Expo Go (Android) o la cámara (iOS)
```

### Backend (FastAPI)

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Mac/Linux

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Documentación API: http://localhost:8000/docs
```

### Ejecutar Pruebas

```bash
cd backend
pytest tests/ -v
```

## 📁 Estructura del Proyecto

```
App_Enfermeria/
├── frontend/                     # React Native (Expo)
│   ├── app/                      # Pantallas (Expo Router)
│   │   ├── (tabs)/               # Navegación por tabs
│   │   │   ├── home.tsx          # Dashboard principal
│   │   │   ├── patients.tsx      # Lista de pacientes
│   │   │   ├── history.tsx       # Historial de valoraciones
│   │   │   └── profile.tsx       # Perfil del enfermero
│   │   ├── assessment/           # Flujo de valoración
│   │   │   ├── [patientId].tsx   # Valoración clínica
│   │   │   └── results.tsx       # Resultados y diagnósticos
│   │   ├── scanner.tsx           # Escáner QR
│   │   └── login.tsx             # Autenticación
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Toggle, Selector, Slider, etc.
│   │   ├── NandaBanner.tsx       # Banner de diagnóstico NANDA
│   │   └── PatientCard.tsx       # Tarjeta de paciente
│   ├── contexts/                 # Estado global
│   │   ├── AuthContext.tsx       # Autenticación
│   │   └── AssessmentContext.tsx  # Valoraciones
│   ├── constants/                # Configuración
│   │   ├── colors.ts             # Sistema de diseño
│   │   └── patterns.ts           # Patrones de Gordon
│   └── utils/
│       └── nandaRules.ts         # Motor de reglas NANDA
│
├── backend/                      # FastAPI (Python)
│   ├── app/
│   │   ├── main.py               # Entry point
│   │   ├── config.py             # Configuración
│   │   ├── models/               # Modelos Pydantic
│   │   ├── routes/               # Endpoints REST
│   │   └── services/             # Lógica de negocio
│   │       ├── nanda_engine.py   # Motor NANDA (backend)
│   │       └── auth_service.py   # JWT + bcrypt
│   └── tests/
│       └── test_nanda_engine.py  # Pruebas unitarias
│
└── README.md
```

## 🧠 Motor de Reglas NANDA

El motor evalúa los datos clínicos en **tiempo real** y sugiere diagnósticos prioritarios:

| Patrón | Condición | Diagnóstico NANDA | Código |
|--------|-----------|-------------------|--------|
| Nutricional | IMC < 18.5 | Desequilibrio Nutricional: Inferior | 00002 |
| Nutricional | IMC ≥ 30 | Desequilibrio Nutricional: Superior | 00001 |
| Nutricional | Disfagia | Deterioro de la Deglución | 00103 |
| Nutricional | Lesiones en piel | Deterioro de Integridad Cutánea | 00046 |
| Sueño | Insomnio activo | Insomnio | 00095 |
| Sueño | < 6 horas + calidad mala | Deprivación de Sueño | 00096 |
| Estrés | Alto + afrontamiento inadecuado | Afrontamiento Ineficaz | 00069 |
| Estrés | Signos de ansiedad | Ansiedad | 00146 |

## 🎨 Diseño

- **Dark Mode** por defecto (reduce fatiga visual en turnos nocturnos)
- Paleta clínica profesional: Sky Blue + Indigo + Verde/Rojo semántico
- Componentes touch-first: toggles, sliders, selectores
- Navegación tipo Acordeón (evita scroll infinito)

## 👥 Créditos

Proyecto de tesis para la defensa académica — **Universidad Autónoma de Zacatecas (UAZ)**

- **Materia**: Ingeniería de Software / Pruebas y Mantenimiento
- **Enfoque**: 11 Patrones Funcionales de Gordon
- **MVP**: 3 patrones críticos (Nutricional, Sueño, Estrés)

## 📄 Licencia

Este proyecto es de uso académico y fue desarrollado como parte de la defensa de tesis.
