import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyALHYBNcdLWI2B8i6ffqiX6OfQeFNHMvaU",
    authDomain: "status-ca955.firebaseapp.com",
    projectId: "status-ca955",
    storageBucket: "status-ca955.firebasestorage.app",
    messagingSenderId: "771908642433",
    appId: "1:771908642433:web:d9a38d658d508fd44e8f80",
    measurementId: "G-6PWH4G0EDK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };