module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo", // Or 'module:metro-react-native-babel-preset' for React Native CLI projects
      "nativewind/babel",
    ],
    plugins: [
      // Other plugins if needed
      "expo-font/app.plugin",
      // Ensure 'react-native-reanimated/plugin' is the last plugin in the array
      "react-native-reanimated/plugin",
    ],
  };
};
