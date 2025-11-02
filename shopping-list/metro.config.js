const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files from Metro bundler
config.resolver.sourceExts = [...config.resolver.sourceExts];
config.resolver.blacklistRE = /.*\.test\.(js|jsx|ts|tsx)$/;

module.exports = config;
