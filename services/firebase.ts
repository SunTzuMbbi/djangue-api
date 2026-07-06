import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDnLZLHlkOoWrJChcMbx_zF4fpwk63CyxU",
  authDomain: "djangue-2f328.firebaseapp.com",
  projectId: "djangue-2f328",
  storageBucket: "djangue-2f328.firebasestorage.app",
  messagingSenderId: "684751574524",
  appId: "1:684751574524:web:96ec805ccb2e636ee64e79"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
