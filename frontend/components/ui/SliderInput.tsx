/**
 * Slider personalizado para input numérico con rango
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../../constants/colors';

interface SliderInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function SliderInput({ label, value, onValueChange, min, max, step = 1, unit }: SliderInputProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const snapToStep = (val: number): number => {
    const stepped = Math.round(val / step) * step;
    return Math.max(min, Math.min(max, Number(stepped.toFixed(2))));
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth));
        const newValue = min + ratio * (max - min);
        onValueChange(snapToStep(newValue));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth));
        const newValue = min + ratio * (max - min);
        onValueChange(snapToStep(newValue));
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
      </View>
      <View style={styles.trackContainer} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${normalizedValue * 100}%` }]} />
        </View>
        <View
          style={[
            styles.thumb,
            { left: `${normalizedValue * 100}%`, marginLeft: -12 },
          ]}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min}</Text>
        <Text style={styles.rangeLabel}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.primaryDark + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  value: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: '700',
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    marginLeft: 4,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
