// Web-specific Metro configuration to optimize font loading
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for web builds
if (process.env.EXPO_PUBLIC_PLATFORM === 'web') {
  config.transformer = {
    ...config.transformer,
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  };
}

module.exports = config;
