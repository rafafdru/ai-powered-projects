import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBjV0r58wL9pBRBnHOd8Z6-NpWTcq5Xgr8',
  authDomain: 'bolao-copa-2026-refd.firebaseapp.com',
  projectId: 'bolao-copa-2026-refd',
  storageBucket: 'bolao-copa-2026-refd.firebasestorage.app',
  messagingSenderId: '645143180534',
  appId: '1:645143180534:web:e740a0530fe4edd3e7e8d7',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
