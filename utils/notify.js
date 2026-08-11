import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a no-op stub (does nothing visible),
// so this falls back to window.alert() on web and uses the real native
// Alert everywhere else.
export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
