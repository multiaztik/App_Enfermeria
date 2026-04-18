# BitCare — NurseAssess

> Sistema de valoración clínica para enfermería basado en los **11 Patrones de Gordon**.
> Aplicación móvil + web construida con React Native (Expo) — 100% offline, sin servidor.

---

## 📱 Características

- **Login y registro local** de enfermeros con nombre de usuario y contraseña
- **Directorio de pacientes** con búsqueda y CRUD completo (crear, editar, eliminar)
- **Valoraciones clínicas** en **11 patrones de Gordon** completos:
  1. Nutricional-Metabólico
  2. Sueño-Descanso
  3. Tolerancia al Estrés
  4. Percepción-Manejo de Salud
  5. Eliminación
  6. Actividad-Ejercicio
  7. Cognitivo-Perceptual
  8. Autopercepción-Autoconcepto
  9. Rol-Relaciones
  10. Sexualidad-Reproducción
  11. Valores-Creencias
- **Motor NANDA-I** para sugerencias diagnósticas automáticas (~30 diagnósticos)
- **Mapa corporal interactivo** con doble cara (frontal y trasera)
- Funciona en **web y dispositivos móviles** — sin necesidad de servidor
- **Almacenamiento local**: SQLite en móvil, AsyncStorage en web
- Cada usuario ve **solo sus propios pacientes** y valoraciones

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React Native · Expo SDK 54 · Expo Router |
| Base de datos (móvil) | SQLite · expo-sqlite |
| Base de datos (web) | AsyncStorage (localStorage) |
| Auth | Autenticación local (sin servidor) |
| Diseño | Sistema "BitCare" — minimalista B&W |

---

## 🚀 Levantar el proyecto

### Requisitos
- Node.js 18+

### ⚡ Ejecución Rápida

```powershell
cd frontend
npm install
```

#### Web
```powershell
npx expo start --web --port 8082
```

#### Expo Go (Móvil)
```powershell
npx expo start -c
```

✅ **La aplicación estará lista en:**
- **Web:** [http://localhost:8082](http://localhost:8082)
- **Móvil en LAN:** `http://<IP-de-tu-PC>:8082`
- **Expo Go:** Escanea el QR de la terminal

#### Controles en la Terminal:
```
› Press w │ Abrir en navegador web
› Press a │ Abrir en Android Emulator  
› Press i │ Abrir en iOS Simulator
› Press r │ Recargar la app
› Press ? │ Ver todos los comandos
```

---

## 🗂 Estructura del proyecto

```
App_Enfermeria/
└── frontend/
    ├── app/
    │   ├── login.tsx               # Inicio de sesión (usuario + contraseña)
    │   ├── register.tsx            # Registro de enfermero
    │   ├── (tabs)/
    │   │   ├── home.tsx            # Dashboard — 11 patrones de Gordon
    │   │   ├── patients.tsx        # Directorio de pacientes
    │   │   ├── history.tsx         # Historial de valoraciones
    │   │   └── profile.tsx         # Perfil + cerrar sesión
    │   ├── patients/
    │   │   ├── new.tsx             # Nuevo paciente
    │   │   └── [id]/edit.tsx       # Editar/eliminar paciente
    │   └── assessment/
    │       └── [patientId].tsx     # Valoración clínica (11 patrones)
    ├── components/ui/
    │   ├── Accordion.tsx           # Acordeón animado
    │   ├── BodyMap.tsx             # Mapa corporal (frontal + trasera)
    │   └── Stepper.tsx             # Selector numérico preciso
    ├── constants/
    │   ├── colors.ts               # Sistema de diseño BitCare
    │   └── patterns.ts             # 11 patrones con campos clínicos
    ├── contexts/
    │   ├── AuthContext.tsx          # Auth local con SQLite
    │   └── AssessmentContext.tsx    # Gestión de valoraciones
    └── utils/
        ├── database.ts             # SQLite (móvil) / AsyncStorage (web)
        └── nandaRules.ts           # Motor de diagnóstico NANDA-I
```

---

## 🏥 Patrones de Gordon implementados

| # | Patrón | Campos |
|---|--------|--------|
| 1 | Nutricional-Metabólico | 16 campos — peso, talla, IMC, edema, piel, mucosas... |
| 2 | Sueño-Descanso | 8 campos — horas, calidad, insomnio, medicación... |
| 3 | Tolerancia al Estrés | 8 campos — nivel, estrategias, soporte social... |
| 4 | Percepción-Manejo de Salud | 9 campos — conocimiento, adherencia, hábitos... |
| 5 | Eliminación | 9 campos — urinaria, intestinal, cutánea, sondas... |
| 6 | Actividad-Ejercicio | 11 campos — movilidad, respiración, autocuidado... |
| 7 | Cognitivo-Perceptual | 9 campos — dolor, orientación, comunicación... |
| 8 | Autopercepción-Autoconcepto | 6 campos — autoestima, imagen corporal... |
| 9 | Rol-Relaciones | 8 campos — estructura familiar, comunicación... |
| 10 | Sexualidad-Reproducción | 5 campos — problemas, anticoncepción... |
| 11 | Valores-Creencias | 7 campos — espiritualidad, conflictos éticos... |

---

## 🗺 Mapa Corporal

El mapa de edemas tiene **dos vistas interactivas**:

- **🧍 Vista Frontal** — 19 zonas: cabeza, cuello, hombros, tórax, abdomen, pelvis, brazos, antebrazos, manos, muslos, espinillas, pies
- **🔙 Vista Trasera** — 21 zonas: nuca, espalda alta/baja, sacro, glúteos, codos, pantorrillas, talones

Se alternan con un botón de toggle animado.

---

## 🔐 Seguridad

- Las contraseñas se almacenan localmente en la base de datos del dispositivo
- Cada usuario solo puede ver y gestionar sus propios pacientes
- No se transmiten datos a servidores externos

---

## 📝 Notas de desarrollo

- **Sin servidor** — toda la app funciona offline con SQLite (móvil) y AsyncStorage (web)
- El módulo `database.ts` detecta automáticamente la plataforma y usa el backend apropiado
- Las sugerencias NANDA-I se evalúan en tiempo real conforme se llenan los campos
- Diseño responsivo para web y móvil sin cambios de código

---

## 👥 Créditos

Desarrollado para prácticas clínicas de enfermería — UAZ
Sistema de diseño: **BitCare** (minimalista, clínico, B&W)
