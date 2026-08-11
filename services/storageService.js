import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isStorageConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.storageBucket;

let app;
if (isStorageConfigured && !getApps().length) {
  app = initializeApp(firebaseConfig);
}

function mockUpload(file) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ mocked: true, url: null }), 2000);
  });
}

// Wired for Firebase Cloud Storage. Falls back to a 2s simulated upload whenever
// the EXPO_PUBLIC_FIREBASE_* env vars aren't set, so the app works with zero
// configuration and upgrades to a real upload the moment Storage is enabled.
// Note: Firebase Storage requires the project's Blaze (pay-as-you-go) plan.
export async function uploadSubmission(file) {
  if (!isStorageConfigured) return mockUpload(file);

  const storage = getStorage(app);
  const fileRef = ref(storage, `submissions/${Date.now()}-${file.name}`);
  const response = await fetch(file.uri);
  const blob = await response.blob();
  await uploadBytes(fileRef, blob);
  const url = await getDownloadURL(fileRef);
  return { mocked: false, url };
}
