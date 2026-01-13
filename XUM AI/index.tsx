import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// In NativeWind v2, global.css is not imported in JS for native.
// We only keep it for web compatibility.
if (Platform.OS === 'web') {
    require('./global.css');
}

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);