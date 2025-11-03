import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

// Type declarations for web elements
declare global {
 namespace JSX {
 interface IntrinsicElements {
 div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
 span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
 }
 }
}

interface WebCompatibleButtonProps {
 title: string;
 onPress: () => void;
 style?: ViewStyle;
 textStyle?: TextStyle;
 disabled?: boolean;
 testID?: string;
}

// Utility function to safely convert React Native styles to web-compatible CSS
const getWebCompatibleStyle = (style: ViewStyle | undefined): Record<string, any> => {
 if (!style) return {};
 
 const webStyle: Record<string, any> = {};
 
 // Safe CSS properties that work in both React Native and web
 const safeProperties = [
 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
 'borderRadius', 'borderWidth', 'borderColor',
 'opacity', 'zIndex'
 ];
 
 safeProperties.forEach(prop => {
 const value = style[prop as keyof ViewStyle];
 if (value !== undefined) {
 webStyle[prop] = value;
 }
 });
 
 // Handle backgroundColor separately to ensure string conversion
 if (style.backgroundColor) {
 webStyle.backgroundColor = String(style.backgroundColor);
 }
 
 return webStyle;
};

const getWebCompatibleTextStyle = (textStyle: TextStyle | undefined): Record<string, any> => {
 if (!textStyle) return {};
 
 const webTextStyle: Record<string, any> = {};
 
 // Safe text CSS properties
 const safeTextProperties = [
 'fontSize', 'fontWeight', 'fontFamily', 'textAlign',
 'textDecorationLine', 'lineHeight'
 ];
 
 safeTextProperties.forEach(prop => {
 const value = textStyle[prop as keyof TextStyle];
 if (value !== undefined) {
 // Handle special cases
 if (prop === 'textDecorationLine') {
 webTextStyle['textDecoration'] = value;
 } else {
 webTextStyle[prop] = value;
 }
 }
 });
 
 // Handle color separately to ensure string conversion
 if (textStyle.color) {
 webTextStyle.color = String(textStyle.color);
 }
 
 return webTextStyle;
};

const WebCompatibleButton: React.FC<WebCompatibleButtonProps> = ({
 title,
 onPress,
 style,
 textStyle,
 disabled = false,
 testID,
}) => {
 const handlePress = () => {
 console.log('WebCompatibleButton: handlePress called');
 if (!disabled && onPress) {
 onPress();
 }
 };

 const handlePressIn = () => {
 console.log('WebCompatibleButton: handlePressIn called');
 };

 const handlePressOut = () => {
 console.log('WebCompatibleButton: handlePressOut called');
 };

 if (Platform.OS === 'web') {
 // Create base web style with safe defaults
 const baseWebStyle = {
 padding: 12,
 borderRadius: 6,
 backgroundColor: '#007AFF',
 display: 'flex' as const,
 alignItems: 'center' as const,
 justifyContent: 'center' as const,
 minHeight: 44,
 border: 'none',
 outline: 'none',
 userSelect: 'none' as const,
 opacity: disabled ? 0.5 : 1,
 cursor: disabled ? 'not-allowed' : 'pointer',
 transition: 'opacity 0.2s ease',
 };

 // Merge with safe converted styles
 const webStyle = {
 ...baseWebStyle,
 ...getWebCompatibleStyle(style),
 };

 const baseTextStyle = {
 color: 'white',
 fontSize: 16,
 fontWeight: '600' as const,
 textAlign: 'center' as const,
 };

 const webTextStyle = {
 ...baseTextStyle,
 ...getWebCompatibleTextStyle(textStyle),
 };

 return (
 <div
 onClick={handlePress}
 style={webStyle as React.CSSProperties}
 data-testid={testID}
 onMouseEnter={(e) => {
 if (!disabled) {
 e.currentTarget.style.opacity = '0.8';
 }
 }}
 onMouseLeave={(e) => {
 if (!disabled) {
 e.currentTarget.style.opacity = '1';
 }
 }}
 >
 <span style={webTextStyle as React.CSSProperties}>
 {title}
 </span>
 </div>
 );
 }

 // For native platforms, use Pressable
 return (
 <Pressable
 onPress={handlePress}
 onPressIn={handlePressIn}
 onPressOut={handlePressOut}
 style={[styles.button, style, disabled && styles.disabled]}
 disabled={disabled}
 testID={testID}
 >
 <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
 {title}
 </Text>
 </Pressable>
 );
};

const styles = StyleSheet.create({
 button: {
 padding: 12,
 borderRadius: 6,
 backgroundColor: '#007AFF',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: 44,
 },
 text: {
 color: 'white',
 fontSize: 16,
 fontWeight: '600',
 },
 disabled: {
 opacity: 0.5,
 },
 disabledText: {
 opacity: 0.7,
 },
});

export default WebCompatibleButton;
