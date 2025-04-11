// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'tflite' to the list of asset extensions Metro should recognize
config.resolver.assetExts = config.resolver.assetExts ?? []; // Ensure assetExts exists
if (!config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
  console.log('Added \'tflite\' to Metro asset extensions.');
}

module.exports = config; 