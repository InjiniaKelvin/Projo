import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { createShadow, SHADOWS } from '@/utils/shadows';

type CardProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};

export function Card({ style, children }: CardProps) {
  return (
    <ThemedView style={[styles.card, style]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    ...SHADOWS.small,
    margin: 8,
  },
});
