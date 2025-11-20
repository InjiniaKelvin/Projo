import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';

export function Input(props: TextInputProps) {
  return (
    <TextInput
      style={[styles.input, props.style]}
      placeholderTextColor={Colors.light.icon}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderColor: Colors.light.icon,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
    marginVertical: 8,
  },
});
