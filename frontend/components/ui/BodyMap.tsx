/**
 * Mapa Corporal Interactivo — Diseño BitCare
 * Silueta humana centrada con zonas seleccionables
 * Funciona en web y móvil
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

/* ─── Zonas del cuerpo ─────────────────────────────────────────────────────
   Las posiciones son en px sobre un canvas de 200×380 (ancho×alto).
   El wrapper tendrá exactamente esas dimensiones centrado en pantalla.
────────────────────────────────────────────────────────────────────────── */
const W = 200; // ancho del canvas
const H = 380; // alto del canvas

interface Zone {
  id: string;
  label: string;
  x: number;  // centro X
  y: number;  // centro Y
  w: number;  // ancho
  h: number;  // alto
  rx?: number; // border-radius
}

const ZONES: Zone[] = [
  // Cabeza
  { id: 'head',          label: 'Cabeza',       x: 100, y: 22,  w: 36, h: 36, rx: 18 },
  // Cuello
  { id: 'neck',          label: 'Cuello',       x: 100, y: 48,  w: 18, h: 12, rx: 4  },
  // Hombro izquierdo
  { id: 'shoulder_l',   label: 'Hombro Izq.',  x:  64, y: 65,  w: 24, h: 16, rx: 8  },
  // Hombro derecho
  { id: 'shoulder_r',   label: 'Hombro Der.',  x: 136, y: 65,  w: 24, h: 16, rx: 8  },
  // Tórax
  { id: 'chest',         label: 'Tórax',        x: 100, y: 90,  w: 54, h: 40, rx: 6  },
  // Abdomen
  { id: 'abdomen',       label: 'Abdomen',      x: 100, y: 138, w: 50, h: 34, rx: 6  },
  // Pelvis
  { id: 'pelvis',        label: 'Pelvis',       x: 100, y: 175, w: 54, h: 22, rx: 6  },
  // Brazo izquierdo
  { id: 'arm_l',         label: 'Brazo Izq.',   x:  58, y: 100, w: 18, h: 44, rx: 9  },
  // Brazo derecho
  { id: 'arm_r',         label: 'Brazo Der.',   x: 142, y: 100, w: 18, h: 44, rx: 9  },
  // Antebrazo izquierdo
  { id: 'forearm_l',    label: 'Ante. Izq.',   x:  51, y: 155, w: 16, h: 36, rx: 8  },
  // Antebrazo derecho
  { id: 'forearm_r',    label: 'Ante. Der.',   x: 149, y: 155, w: 16, h: 36, rx: 8  },
  // Mano izquierda
  { id: 'hand_l',        label: 'Mano Izq.',    x:  50, y: 188, w: 14, h: 16, rx: 5  },
  // Mano derecha
  { id: 'hand_r',        label: 'Mano Der.',    x: 150, y: 188, w: 14, h: 16, rx: 5  },
  // Muslo izquierdo
  { id: 'thigh_l',       label: 'Muslo Izq.',   x:  84, y: 215, w: 22, h: 44, rx: 11 },
  // Muslo derecho
  { id: 'thigh_r',       label: 'Muslo Der.',   x: 116, y: 215, w: 22, h: 44, rx: 11 },
  // Pierna izquierda
  { id: 'leg_l',         label: 'Pierna Izq.',  x:  83, y: 275, w: 20, h: 44, rx: 10 },
  // Pierna derecha
  { id: 'leg_r',         label: 'Pierna Der.',  x: 117, y: 275, w: 20, h: 44, rx: 10 },
  // Pie izquierdo
  { id: 'foot_l',        label: 'Pie Izq.',     x:  80, y: 332, w: 24, h: 16, rx: 5  },
  // Pie derecho
  { id: 'foot_r',        label: 'Pie Der.',     x: 120, y: 332, w: 24, h: 16, rx: 5  },
];

interface BodyMapProps {
  label: string;
  selectedZones: string[];
  onZonesChange: (zones: string[]) => void;
}

export function BodyMap({ label, selectedZones, onZonesChange }: BodyMapProps) {
  const toggle = (id: string) => {
    if (selectedZones.includes(id)) {
      onZonesChange(selectedZones.filter((z) => z !== id));
    } else {
      onZonesChange([...selectedZones, id]);
    }
  };

  const selectedLabels = ZONES.filter((z) => selectedZones.includes(z.id)).map((z) => z.label);

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.instruction}>Toca una zona del cuerpo para seleccionarla</Text>

      {/* Canvas con silueta */}
      <View style={styles.canvasWrapper}>
        <View style={[styles.canvas, { width: W, height: H }]}>
          {/* Silueta de fondo (puro View) */}
          <BodySilhouette />

          {/* Zonas clicables */}
          {ZONES.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            return (
              <TouchableOpacity
                key={zone.id}
                activeOpacity={0.6}
                onPress={() => toggle(zone.id)}
                style={[
                  styles.zone,
                  {
                    left: zone.x - zone.w / 2,
                    top: zone.y - zone.h / 2,
                    width: zone.w,
                    height: zone.h,
                    borderRadius: zone.rx ?? 4,
                  },
                  isSelected && styles.zoneSelected,
                ]}
              >
                {isSelected && <View style={styles.zoneDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Chips de zonas seleccionadas */}
      {selectedLabels.length > 0 && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>Zonas marcadas:</Text>
          <View style={styles.chipsRow}>
            {selectedLabels.map((lbl, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* ─── Silueta dibujada con Views ──────────────────────────────────────── */
const SIL = '#CCCCCC';

function BodySilhouette() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Cabeza */}
      <View style={[sil.base, { left: 82, top: 4, width: 36, height: 36, borderRadius: 18, backgroundColor: SIL }]} />
      {/* Cuello */}
      <View style={[sil.base, { left: 91, top: 40, width: 18, height: 14, borderRadius: 4, backgroundColor: SIL }]} />
      {/* Hombros */}
      <View style={[sil.base, { left: 52, top: 56, width: 98, height: 18, borderRadius: 9, backgroundColor: SIL }]} />
      {/* Torso */}
      <View style={[sil.base, { left: 73, top: 68, width: 54, height: 44, borderRadius: 6, backgroundColor: SIL }]} />
      {/* Abdomen */}
      <View style={[sil.base, { left: 75, top: 110, width: 50, height: 36, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Pelvis */}
      <View style={[sil.base, { left: 73, top: 144, width: 54, height: 24, borderRadius: 8, backgroundColor: SIL }]} />
      {/* Brazo izquierdo */}
      <View style={[sil.base, { left: 49, top: 72, width: 18, height: 50, borderRadius: 9, backgroundColor: SIL }]} />
      {/* Brazo derecho */}
      <View style={[sil.base, { left: 133, top: 72, width: 18, height: 50, borderRadius: 9, backgroundColor: SIL }]} />
      {/* Antebrazo izquierdo */}
      <View style={[sil.base, { left: 43, top: 120, width: 16, height: 42, borderRadius: 8, backgroundColor: SIL }]} />
      {/* Antebrazo derecho */}
      <View style={[sil.base, { left: 141, top: 120, width: 16, height: 42, borderRadius: 8, backgroundColor: SIL }]} />
      {/* Mano izquierda */}
      <View style={[sil.base, { left: 43, top: 160, width: 16, height: 18, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Mano derecha */}
      <View style={[sil.base, { left: 141, top: 160, width: 16, height: 18, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Muslo izquierdo */}
      <View style={[sil.base, { left: 73, top: 166, width: 22, height: 52, borderRadius: 11, backgroundColor: SIL }]} />
      {/* Muslo derecho */}
      <View style={[sil.base, { left: 105, top: 166, width: 22, height: 52, borderRadius: 11, backgroundColor: SIL }]} />
      {/* Pierna izquierda */}
      <View style={[sil.base, { left: 73, top: 216, width: 20, height: 52, borderRadius: 10, backgroundColor: SIL }]} />
      {/* Pierna derecha */}
      <View style={[sil.base, { left: 107, top: 216, width: 20, height: 52, borderRadius: 10, backgroundColor: SIL }]} />
      {/* Pie izquierdo */}
      <View style={[sil.base, { left: 68, top: 266, width: 28, height: 16, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Pie derecho */}
      <View style={[sil.base, { left: 104, top: 266, width: 28, height: 16, borderRadius: 5, backgroundColor: SIL }]} />
    </View>
  );
}

const sil = StyleSheet.create({
  base: {
    position: 'absolute',
  },
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  instruction: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  canvasWrapper: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  canvas: {
    position: 'relative',
  },
  zone: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneSelected: {
    backgroundColor: Colors.danger + '35',
    borderColor: Colors.danger,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  selectedBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.dangerBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger + '25',
  },
  selectedTitle: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    fontWeight: '600',
  },
});
