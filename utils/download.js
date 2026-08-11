import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Produces a real, saved file on both platforms:
//   web    -> Blob + <a download>, so the file lands in the browser's downloads
//   native -> expo-print renders a PDF, then expo-sharing opens the share sheet
// expo-print's printToFileAsync isn't supported on web, which is why the two
// paths differ rather than sharing one implementation.
export async function downloadDocument({ html, text, filename }) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text ?? html], {
      type: text ? 'text/plain;charset=utf-8' : 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { uri: filename, shared: false };
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    return { uri, shared: true };
  }
  return { uri, shared: false };
}
