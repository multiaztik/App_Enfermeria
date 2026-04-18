/**
 * Mapa Corporal Interactivo — Diseño BitCare
 * Silueta humana con vista FRONTAL y TRASERA
 * Funciona en web y móvil — sin dependencias externas de SVG
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

/* ─── Zonas del cuerpo ─────────────────────────────────────────────────────
   Las posiciones son en px sobre un canvas de 200×340 (ancho×alto).
   Zonas frontales y traseras separadas.
────────────────────────────────────────────────────────────────────────── */
const W = 200;
const H = 340;

interface Zone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
}

/* ── Vista Frontal ── */
const FRONT_ZONES: Zone[] = [
  { id: 'f_head',        label: 'Cabeza (frontal)',     x: 100, y: 22,  w: 36, h: 36, rx: 18 },
  { id: 'f_neck',        label: 'Cuello',               x: 100, y: 48,  w: 18, h: 12, rx: 4  },
  { id: 'f_shoulder_l',  label: 'Hombro Izq.',          x:  64, y: 65,  w: 24, h: 16, rx: 8  },
  { id: 'f_shoulder_r',  label: 'Hombro Der.',          x: 136, y: 65,  w: 24, h: 16, rx: 8  },
  { id: 'f_chest',       label: 'Tórax',                x: 100, y: 90,  w: 54, h: 40, rx: 6  },
  { id: 'f_abdomen',     label: 'Abdomen',              x: 100, y: 138, w: 50, h: 34, rx: 6  },
  { id: 'f_pelvis',      label: 'Pelvis',               x: 100, y: 175, w: 54, h: 22, rx: 6  },
  { id: 'f_arm_l',       label: 'Brazo Izq.',           x:  55, y: 100, w: 18, h: 44, rx: 9  },
  { id: 'f_arm_r',       label: 'Brazo Der.',           x: 145, y: 100, w: 18, h: 44, rx: 9  },
  { id: 'f_forearm_l',   label: 'Antebrazo Izq.',       x:  48, y: 150, w: 16, h: 36, rx: 8  },
  { id: 'f_forearm_r',   label: 'Antebrazo Der.',       x: 152, y: 150, w: 16, h: 36, rx: 8  },
  { id: 'f_hand_l',      label: 'Mano Izq.',            x:  46, y: 185, w: 14, h: 16, rx: 5  },
  { id: 'f_hand_r',      label: 'Mano Der.',            x: 154, y: 185, w: 14, h: 16, rx: 5  },
  { id: 'f_thigh_l',     label: 'Muslo Izq.',           x:  84, y: 215, w: 22, h: 44, rx: 11 },
  { id: 'f_thigh_r',     label: 'Muslo Der.',           x: 116, y: 215, w: 22, h: 44, rx: 11 },
  { id: 'f_shin_l',      label: 'Espinilla Izq.',       x:  83, y: 270, w: 20, h: 40, rx: 10 },
  { id: 'f_shin_r',      label: 'Espinilla Der.',       x: 117, y: 270, w: 20, h: 40, rx: 10 },
  { id: 'f_foot_l',      label: 'Pie Izq.',             x:  80, y: 316, w: 24, h: 16, rx: 5  },
  { id: 'f_foot_r',      label: 'Pie Der.',             x: 120, y: 316, w: 24, h: 16, rx: 5  },
];

/* ── Vista Trasera ── */
const BACK_ZONES: Zone[] = [
  { id: 'b_head',         label: 'Nuca',                x: 100, y: 22,  w: 36, h: 36, rx: 18 },
  { id: 'b_neck',         label: 'Cuello (posterior)',   x: 100, y: 48,  w: 18, h: 12, rx: 4  },
  { id: 'b_shoulder_l',   label: 'Hombro Izq. (post.)', x:  64, y: 65,  w: 24, h: 16, rx: 8  },
  { id: 'b_shoulder_r',   label: 'Hombro Der. (post.)', x: 136, y: 65,  w: 24, h: 16, rx: 8  },
  { id: 'b_upper_back',   label: 'Espalda Alta',        x: 100, y: 90,  w: 54, h: 40, rx: 6  },
  { id: 'b_lower_back',   label: 'Espalda Baja / Lumbar', x: 100, y: 138, w: 50, h: 34, rx: 6 },
  { id: 'b_sacrum',       label: 'Sacro',               x: 100, y: 172, w: 36, h: 18, rx: 6  },
  { id: 'b_glute_l',      label: 'Glúteo Izq.',         x:  84, y: 192, w: 26, h: 22, rx: 8  },
  { id: 'b_glute_r',      label: 'Glúteo Der.',         x: 116, y: 192, w: 26, h: 22, rx: 8  },
  { id: 'b_arm_l',        label: 'Brazo Izq. (post.)',  x:  55, y: 100, w: 18, h: 44, rx: 9  },
  { id: 'b_arm_r',        label: 'Brazo Der. (post.)',  x: 145, y: 100, w: 18, h: 44, rx: 9  },
  { id: 'b_elbow_l',      label: 'Codo Izq.',           x:  50, y: 140, w: 16, h: 16, rx: 8  },
  { id: 'b_elbow_r',      label: 'Codo Der.',           x: 150, y: 140, w: 16, h: 16, rx: 8  },
  { id: 'b_forearm_l',    label: 'Antebrazo Izq. (post.)', x: 48, y: 158, w: 16, h: 28, rx: 8 },
  { id: 'b_forearm_r',    label: 'Antebrazo Der. (post.)', x: 152, y: 158, w: 16, h: 28, rx: 8 },
  { id: 'b_thigh_l',      label: 'Muslo Izq. (post.)',  x:  84, y: 222, w: 22, h: 38, rx: 11 },
  { id: 'b_thigh_r',      label: 'Muslo Der. (post.)',  x: 116, y: 222, w: 22, h: 38, rx: 11 },
  { id: 'b_calf_l',       label: 'Pantorrilla Izq.',    x:  83, y: 270, w: 20, h: 36, rx: 10 },
  { id: 'b_calf_r',       label: 'Pantorrilla Der.',    x: 117, y: 270, w: 20, h: 36, rx: 10 },
  { id: 'b_heel_l',       label: 'Talón Izq.',          x:  80, y: 316, w: 20, h: 14, rx: 5  },
  { id: 'b_heel_r',       label: 'Talón Der.',          x: 120, y: 316, w: 20, h: 14, rx: 5  },
];

const ALL_ZONES = [...FRONT_ZONES, ...BACK_ZONES];

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface BodyMapProps {
  label: string;
  selectedZones: string[];
  onZonesChange: (zones: string[]) => void;
}

export function BodyMap({ label, selectedZones, onZonesChange }: BodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const flipAnim = React.useRef(new Animated.Value(0)).current;

  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES;

  const switchView = (newView: 'front' | 'back') => {
    Animated.sequence([
      Animated.timing(flipAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    setView(newView);
  };

  const toggle = (id: string) => {
    if (selectedZones.includes(id)) {
      onZonesChange(selectedZones.filter((z) => z !== id));
    } else {
      onZonesChange([...selectedZones, id]);
    }
  };

  const frontCount = selectedZones.filter((z) => z.startsWith('f_')).length;
  const backCount = selectedZones.filter((z) => z.startsWith('b_')).length;
  const selectedLabels = ALL_ZONES.filter((z) => selectedZones.includes(z.id)).map((z) => z.label);

  const canvasScale = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const canvasOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.instruction}>Toca una zona del cuerpo • Usa los botones para girar</Text>

      {/* Toggle Frontal / Trasera */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewBtn, view === 'front' && styles.viewBtnActive]}
          onPress={() => switchView('front')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewBtnText, view === 'front' && styles.viewBtnTextActive]}>
            🧍 Frontal {frontCount > 0 ? `(${frontCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewBtn, view === 'back' && styles.viewBtnActive]}
          onPress={() => switchView('back')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewBtnText, view === 'back' && styles.viewBtnTextActive]}>
            🔄 Trasera {backCount > 0 ? `(${backCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Canvas con silueta animada */}
      <View style={styles.canvasWrapper}>
        {/* Indicador de vista */}
        <View style={styles.viewIndicator}>
          <Text style={styles.viewIndicatorText}>
            {view === 'front' ? '👤 Vista Frontal' : '🔙 Vista Trasera'}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: canvasScale }], opacity: canvasOpacity }}>
          <View style={[styles.canvas, { width: W, height: H }]}>
            {/* Silueta de fondo */}
            <BodySilhouette side={view} />

            {/* Zonas clicables */}
            {zones.map((zone) => {
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
        </Animated.View>
      </View>

      {/* Chips de zonas seleccionadas */}
      {selectedLabels.length > 0 && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>
            Zonas marcadas ({selectedLabels.length}):
          </Text>
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
const SIL_FRONT = '#CCCCCC';
const SIL_BACK = '#BBBBBB';

function BodySilhouette({ side }: { side: 'front' | 'back' }) {
  const SIL = side === 'front' ? SIL_FRONT : SIL_BACK;

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

      {side === 'back' && (
        /* Línea espinal (decorativa) */
        <View style={[sil.base, { left: 99, top: 58, width: 2, height: 80, backgroundColor: SIL_FRONT + '60' }]} />
      )}

      {/* Abdomen / Lower back */}
      <View style={[sil.base, { left: 75, top: 110, width: 50, height: 36, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Pelvis / Sacro */}
      <View style={[sil.base, { left: 73, top: 144, width: 54, height: 30, borderRadius: 8, backgroundColor: SIL }]} />
      {/* Brazos */}
      <View style={[sil.base, { left: 46, top: 72, width: 18, height: 50, borderRadius: 9, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 136, top: 72, width: 18, height: 50, borderRadius: 9, backgroundColor: SIL }]} />
      {/* Antebrazos */}
      <View style={[sil.base, { left: 40, top: 120, width: 16, height: 42, borderRadius: 8, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 144, top: 120, width: 16, height: 42, borderRadius: 8, backgroundColor: SIL }]} />
      {/* Manos */}
      <View style={[sil.base, { left: 39, top: 160, width: 16, height: 18, borderRadius: 5, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 145, top: 160, width: 16, height: 18, borderRadius: 5, backgroundColor: SIL }]} />
      {/* Muslos */}
      <View style={[sil.base, { left: 73, top: 172, width: 22, height: 52, borderRadius: 11, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 105, top: 172, width: 22, height: 52, borderRadius: 11, backgroundColor: SIL }]} />
      {/* Piernas / Pantorrillas */}
      <View style={[sil.base, { left: 73, top: 222, width: 20, height: 52, borderRadius: 10, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 107, top: 222, width: 20, height: 52, borderRadius: 10, backgroundColor: SIL }]} />
      {/* Pies / Talones */}
      <View style={[sil.base, { left: 68, top: 272, width: 28, height: 16, borderRadius: 5, backgroundColor: SIL }]} />
      <View style={[sil.base, { left: 104, top: 272, width: 28, height: 16, borderRadius: 5, backgroundColor: SIL }]} />

      {side === 'back' && (
        <>
          {/* Marcas de omóplatos */}
          <View style={[sil.base, { left: 78, top: 72, width: 14, height: 20, borderRadius: 7, backgroundColor: SIL_FRONT + '30' }]} />
          <View style={[sil.base, { left: 108, top: 72, width: 14, height: 20, borderRadius: 7, backgroundColor: SIL_FRONT + '30' }]} />
        </>
      )}
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
    marginBottom: Spacing.sm,
  },
  /* Toggle frontal / trasera */
  viewToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  viewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  viewBtnTextActive: {
    color: Colors.white,
  },
  /* Canvas */
  canvasWrapper: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg + Spacing.md,
  },
  viewIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewIndicatorText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
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
