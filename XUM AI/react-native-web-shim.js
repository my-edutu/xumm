// Shim for missing exports in react-native-web that some expo-modules expect
export * from 'react-native-web';

export const TurboModuleRegistry = {
    get: () => null,
    getEnforcing: () => null,
};

export const NativeModules = {};
