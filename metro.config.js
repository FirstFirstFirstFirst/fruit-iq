// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable watchman on Windows to fix file watcher issues
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
};

module.exports = config;
