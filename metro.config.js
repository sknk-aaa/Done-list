const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Drizzle migrations are bundled as .sql files
config.resolver.sourceExts.push('sql');

// expo-sqlite web ships a WebAssembly build
config.resolver.assetExts.push('wasm');

module.exports = config;
