'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  projectId: 'new-prototype-qzb8x',
  appId: '1:304062341563:web:0a6f416b4b5f281798e49e',
  storageBucket: 'new-prototype-qzb8x.firebasestorage.app',
  apiKey: 'AIzaSyD5ltl22-KVKD97Zs08U8dbr5g9fzNdKMU',
  authDomain: 'new-prototype-qzb8x.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '304062341563',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };
