// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDH1MbfmYkqrVXIrPQTdPk4Fl3uJ8UdzI4",
    authDomain: "atsomnews.firebaseapp.com",
    projectId: "atsomnews",
    storageBucket: "atsomnews.firebasestorage.app",
    messagingSenderId: "356172763397",
    appId: "1:356172763397:web:d31f6c6397149b57ea676c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export { db };
