const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Configure resolverMainFields for better web compatibility 
config.resolver.resolverMainFields = ['browser', 'main'];

// Add source extensions for platform-specific files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx', 'tsx', 'ts'];

// Configure aliases to handle problematic native modules on web
config.resolver.alias = {
 ...(config.resolver.alias || {}),
 // Handle react-native native utilities that don't work on web
 'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, 'web-mocks/codegenNativeCommands.js'),
 'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'web-mocks/codegenNativeComponent.js'),
};

// MEMORY OPTIMIZATION: Reduce worker threads to save RAM
config.transformer = {
 ...config.transformer,
 minifierConfig: {
   compress: {
     drop_console: false, // Keep console logs for debugging
   },
 },
 // Reduce from default 4 workers to 2 (saves ~400MB RAM)
 maxWorkers: 2,
};

module.exports = config;
