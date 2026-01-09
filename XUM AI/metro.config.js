const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for more extensions, including those used by Supabase
config.resolver.sourceExts = [...config.resolver.sourceExts, 'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'cjs', 'mjs'];

// Alias react-native to react-native-web for web builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
