import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '../ThemedText';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
};

export function Button({ title, variant = 'primary', isLoading = false, style, disabled, ...props }: ButtonProps) {
  const backgroundColor = 
    variant === 'primary' ? Colors.light.tint :
    variant === 'secondary' ? '#6c757d' :
    variant === 'danger' ? '#dc3545' :
    'transparent';

  const textColor = variant === 'outline' ? Colors.light.tint : '#fff';
  const borderColor = variant === 'outline' ? Colors.light.tint : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor, borderColor, borderWidth },
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText style={[styles.text, { color: textColor }]}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    flexDirection: 'row',
    minHeight: 48, // Ensure touch target size
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
