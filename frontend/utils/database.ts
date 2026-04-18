/**
 * Base de Datos Local — BitCare
 * Capa de persistencia multiplataforma:
 *   - Móvil (Android/iOS): SQLite embebida (expo-sqlite)
 *   - Web: AsyncStorage como fallback (JSON en localStorage)
 * Cada usuario ve únicamente sus propios pacientes y valoraciones
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ════════════════════════════════════════════════════════════════════════
   INTERFACES COMPARTIDAS
   ════════════════════════════════════════════════════════════════════════ */

export interface DBUser {
  id: number;
  username: string;
  nombre: string;
  cedula: string;
  role: string;
  consentimiento_legal: boolean;
}

export interface DBPatient {
  id: number;
  user_id: number;
  nombre: string;
  edad: number;
  sexo: string;
  peso: number | null;
  talla: number | null;
  alergias: string[];
  diagnostico_medico: string;
}

export interface DBAssessment {
  id: number;
  patient_id: number;
  user_id: number;
  date: string;
  patterns: Record<string, Record<string, unknown>>;
  suggestions: unknown[];
  status: string;
}

/* ════════════════════════════════════════════════════════════════════════
   WEB FALLBACK — AsyncStorage como "base de datos" JSON
   ════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEYS = {
  users: 'bitcare_users',
  patients: 'bitcare_patients',
  assessments: 'bitcare_assessments',
  idCounters: 'bitcare_id_counters',
};

interface WebDB {
  users: (DBUser & { password: string })[];
  patients: DBPatient[];
  assessments: DBAssessment[];
  counters: { users: number; patients: number; assessments: number };
}

async function loadWebDB(): Promise<WebDB> {
  try {
    const [usersStr, patientsStr, assessmentsStr, countersStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.users),
      AsyncStorage.getItem(STORAGE_KEYS.patients),
      AsyncStorage.getItem(STORAGE_KEYS.assessments),
      AsyncStorage.getItem(STORAGE_KEYS.idCounters),
    ]);
    return {
      users: usersStr ? JSON.parse(usersStr) : [],
      patients: patientsStr ? JSON.parse(patientsStr) : [],
      assessments: assessmentsStr ? JSON.parse(assessmentsStr) : [],
      counters: countersStr ? JSON.parse(countersStr) : { users: 0, patients: 0, assessments: 0 },
    };
  } catch {
    return { users: [], patients: [], assessments: [], counters: { users: 0, patients: 0, assessments: 0 } };
  }
}

async function saveWebDB(db: WebDB): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(db.users)),
    AsyncStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(db.patients)),
    AsyncStorage.setItem(STORAGE_KEYS.assessments, JSON.stringify(db.assessments)),
    AsyncStorage.setItem(STORAGE_KEYS.idCounters, JSON.stringify(db.counters)),
  ]);
}

/* ─── Web: Usuarios ─── */
async function webRegisterUser(data: { username: string; password: string; nombre: string; cedula: string; consentimiento_legal: boolean }): Promise<DBUser> {
  const db = await loadWebDB();
  if (db.users.find((u) => u.username === data.username)) {
    throw new Error('El nombre de usuario ya existe');
  }
  db.counters.users += 1;
  const user = { id: db.counters.users, username: data.username, password: data.password, nombre: data.nombre, cedula: data.cedula, role: 'nurse', consentimiento_legal: data.consentimiento_legal };
  db.users.push(user);
  await saveWebDB(db);
  const { password: _, ...safeUser } = user;
  return safeUser;
}

async function webLoginUser(username: string, password: string): Promise<DBUser> {
  const db = await loadWebDB();
  const user = db.users.find((u) => u.username === username);
  if (!user) throw new Error('Usuario no encontrado');
  if (user.password !== password) throw new Error('Contraseña incorrecta');
  const { password: _, ...safeUser } = user;
  return { ...safeUser, consentimiento_legal: user.consentimiento_legal ?? false };
}

/* ─── Web: Pacientes ─── */
async function webGetPatients(userId: number, search?: string): Promise<DBPatient[]> {
  const db = await loadWebDB();
  let result = db.patients.filter((p) => p.user_id === userId);
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    result = result.filter((p) => p.nombre.toLowerCase().includes(term) || p.diagnostico_medico.toLowerCase().includes(term));
  }
  return result.sort((a, b) => b.id - a.id);
}

async function webGetPatientById(patientId: number, userId: number): Promise<DBPatient | null> {
  const db = await loadWebDB();
  return db.patients.find((p) => p.id === patientId && p.user_id === userId) || null;
}

async function webCreatePatient(userId: number, data: { nombre: string; edad: number; sexo: string; peso?: number; talla?: number; alergias: string[]; diagnostico_medico: string }): Promise<DBPatient> {
  const db = await loadWebDB();
  db.counters.patients += 1;
  const patient: DBPatient = {
    id: db.counters.patients, user_id: userId,
    nombre: data.nombre, edad: data.edad, sexo: data.sexo,
    peso: data.peso ?? null, talla: data.talla ?? null,
    alergias: data.alergias, diagnostico_medico: data.diagnostico_medico,
  };
  db.patients.push(patient);
  await saveWebDB(db);
  return patient;
}

async function webUpdatePatient(patientId: number, userId: number, data: Partial<{ nombre: string; edad: number; sexo: string; peso: number; talla: number; alergias: string[]; diagnostico_medico: string }>): Promise<void> {
  const db = await loadWebDB();
  const idx = db.patients.findIndex((p) => p.id === patientId && p.user_id === userId);
  if (idx === -1) return;
  db.patients[idx] = { ...db.patients[idx], ...data } as DBPatient;
  await saveWebDB(db);
}

async function webDeletePatient(patientId: number, userId: number): Promise<void> {
  const db = await loadWebDB();
  db.assessments = db.assessments.filter((a) => !(a.patient_id === patientId && a.user_id === userId));
  db.patients = db.patients.filter((p) => !(p.id === patientId && p.user_id === userId));
  await saveWebDB(db);
}

/* ─── Web: Valoraciones ─── */
async function webSaveAssessment(userId: number, data: { patient_id: number; patterns: Record<string, Record<string, unknown>>; suggestions: unknown[]; status: string }): Promise<DBAssessment> {
  const db = await loadWebDB();
  db.counters.assessments += 1;
  const assessment: DBAssessment = {
    id: db.counters.assessments, patient_id: data.patient_id, user_id: userId,
    date: new Date().toISOString(), patterns: data.patterns, suggestions: data.suggestions, status: data.status,
  };
  db.assessments.push(assessment);
  await saveWebDB(db);
  return assessment;
}

async function webGetAssessments(userId: number, patientId?: number): Promise<DBAssessment[]> {
  const db = await loadWebDB();
  let result = db.assessments.filter((a) => a.user_id === userId);
  if (patientId) result = result.filter((a) => a.patient_id === patientId);
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/* ════════════════════════════════════════════════════════════════════════
   NATIVO — SQLite (Android / iOS)
   ════════════════════════════════════════════════════════════════════════ */

let _sqliteModule: typeof import('expo-sqlite') | null = null;
let _db: any = null;

async function getSQLiteDB() {
  if (_db) return _db;
  if (!_sqliteModule) {
    _sqliteModule = require('expo-sqlite');
  }
  _db = await _sqliteModule!.openDatabaseAsync('bitcare.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      cedula TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'nurse',
      consentimiento_legal INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      edad INTEGER NOT NULL,
      sexo TEXT NOT NULL DEFAULT 'M',
      peso REAL,
      talla REAL,
      alergias TEXT NOT NULL DEFAULT '[]',
      diagnostico_medico TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      patterns TEXT NOT NULL DEFAULT '{}',
      suggestions TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'in_progress',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  return _db;
}

/* ─── Nativo: Usuarios ─── */
async function nativeRegisterUser(data: { username: string; password: string; nombre: string; cedula: string; consentimiento_legal: boolean }): Promise<DBUser> {
  const db = await getSQLiteDB();
  const existing = await db.getFirstAsync('SELECT id FROM users WHERE username = ?', [data.username]);
  if (existing) throw new Error('El nombre de usuario ya existe');
  const result = await db.runAsync(
    'INSERT INTO users (username, password, nombre, cedula, consentimiento_legal) VALUES (?, ?, ?, ?, ?)',
    [data.username, data.password, data.nombre, data.cedula, data.consentimiento_legal ? 1 : 0]
  );
  return { id: result.lastInsertRowId, username: data.username, nombre: data.nombre, cedula: data.cedula, role: 'nurse', consentimiento_legal: data.consentimiento_legal };
}

async function nativeLoginUser(username: string, password: string): Promise<DBUser> {
  const db = await getSQLiteDB();
  const row = await db.getFirstAsync('SELECT id, username, nombre, cedula, role, password, consentimiento_legal FROM users WHERE username = ?', [username]);
  if (!row) throw new Error('Usuario no encontrado');
  if ((row as any).password !== password) throw new Error('Contraseña incorrecta');
  return { id: (row as any).id, username: (row as any).username, nombre: (row as any).nombre, cedula: (row as any).cedula, role: (row as any).role, consentimiento_legal: !!(row as any).consentimiento_legal };
}

/* ─── Nativo: Pacientes ─── */
async function nativeGetPatients(userId: number, search?: string): Promise<DBPatient[]> {
  const db = await getSQLiteDB();
  let query = 'SELECT * FROM patients WHERE user_id = ?';
  const params: (string | number)[] = [userId];
  if (search && search.trim()) {
    query += ' AND (nombre LIKE ? OR diagnostico_medico LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }
  query += ' ORDER BY created_at DESC';
  const rows = await db.getAllAsync(query, params);
  return (rows as any[]).map((r) => ({ ...r, alergias: JSON.parse(r.alergias || '[]') }));
}

async function nativeGetPatientById(patientId: number, userId: number): Promise<DBPatient | null> {
  const db = await getSQLiteDB();
  const row = await db.getFirstAsync('SELECT * FROM patients WHERE id = ? AND user_id = ?', [patientId, userId]);
  if (!row) return null;
  return { ...(row as any), alergias: JSON.parse((row as any).alergias || '[]') };
}

async function nativeCreatePatient(userId: number, data: { nombre: string; edad: number; sexo: string; peso?: number; talla?: number; alergias: string[]; diagnostico_medico: string }): Promise<DBPatient> {
  const db = await getSQLiteDB();
  const result = await db.runAsync(
    'INSERT INTO patients (user_id, nombre, edad, sexo, peso, talla, alergias, diagnostico_medico) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, data.nombre, data.edad, data.sexo, data.peso ?? null, data.talla ?? null, JSON.stringify(data.alergias), data.diagnostico_medico]
  );
  return { id: result.lastInsertRowId, user_id: userId, nombre: data.nombre, edad: data.edad, sexo: data.sexo, peso: data.peso ?? null, talla: data.talla ?? null, alergias: data.alergias, diagnostico_medico: data.diagnostico_medico };
}

async function nativeUpdatePatient(patientId: number, userId: number, data: Partial<{ nombre: string; edad: number; sexo: string; peso: number; talla: number; alergias: string[]; diagnostico_medico: string }>): Promise<void> {
  const db = await getSQLiteDB();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  if (data.nombre !== undefined) { sets.push('nombre = ?'); params.push(data.nombre); }
  if (data.edad !== undefined) { sets.push('edad = ?'); params.push(data.edad); }
  if (data.sexo !== undefined) { sets.push('sexo = ?'); params.push(data.sexo); }
  if (data.peso !== undefined) { sets.push('peso = ?'); params.push(data.peso); }
  if (data.talla !== undefined) { sets.push('talla = ?'); params.push(data.talla); }
  if (data.alergias !== undefined) { sets.push('alergias = ?'); params.push(JSON.stringify(data.alergias)); }
  if (data.diagnostico_medico !== undefined) { sets.push('diagnostico_medico = ?'); params.push(data.diagnostico_medico); }
  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  params.push(patientId, userId);
  await db.runAsync(`UPDATE patients SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, params);
}

async function nativeDeletePatient(patientId: number, userId: number): Promise<void> {
  const db = await getSQLiteDB();
  await db.runAsync('DELETE FROM assessments WHERE patient_id = ? AND user_id = ?', [patientId, userId]);
  await db.runAsync('DELETE FROM patients WHERE id = ? AND user_id = ?', [patientId, userId]);
}

/* ─── Nativo: Valoraciones ─── */
async function nativeSaveAssessment(userId: number, data: { patient_id: number; patterns: Record<string, Record<string, unknown>>; suggestions: unknown[]; status: string }): Promise<DBAssessment> {
  const db = await getSQLiteDB();
  const result = await db.runAsync(
    'INSERT INTO assessments (patient_id, user_id, patterns, suggestions, status) VALUES (?, ?, ?, ?, ?)',
    [data.patient_id, userId, JSON.stringify(data.patterns), JSON.stringify(data.suggestions), data.status]
  );
  return { id: result.lastInsertRowId, patient_id: data.patient_id, user_id: userId, date: new Date().toISOString(), patterns: data.patterns, suggestions: data.suggestions, status: data.status };
}

async function nativeGetAssessments(userId: number, patientId?: number): Promise<DBAssessment[]> {
  const db = await getSQLiteDB();
  let query = 'SELECT * FROM assessments WHERE user_id = ?';
  const params: (string | number)[] = [userId];
  if (patientId) { query += ' AND patient_id = ?'; params.push(patientId); }
  query += ' ORDER BY date DESC';
  const rows = await db.getAllAsync(query, params);
  return (rows as any[]).map((r) => ({ ...r, patterns: JSON.parse(r.patterns || '{}'), suggestions: JSON.parse(r.suggestions || '[]') }));
}

/* ════════════════════════════════════════════════════════════════════════
   API PÚBLICA — Se elige automáticamente según la plataforma
   ════════════════════════════════════════════════════════════════════════ */

const isWeb = Platform.OS === 'web';

export const registerUser = isWeb ? webRegisterUser : nativeRegisterUser;
export const loginUser = isWeb ? webLoginUser : nativeLoginUser;
export const getPatients = isWeb ? webGetPatients : nativeGetPatients;
export const getPatientById = isWeb ? webGetPatientById : nativeGetPatientById;
export const createPatient = isWeb ? webCreatePatient : nativeCreatePatient;
export const updatePatient = isWeb ? webUpdatePatient : nativeUpdatePatient;
export const deletePatient = isWeb ? webDeletePatient : nativeDeletePatient;
export const saveAssessment = isWeb ? webSaveAssessment : nativeSaveAssessment;
export const getAssessments = isWeb ? webGetAssessments : nativeGetAssessments;
