// js/firebase-config.js

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRZNNttD6Tp5xg9Ycq6ll06Ih_FAkaYXA",
  authDomain: "assistenciatech-eb8f0.firebaseapp.com",
  projectId: "assistenciatech-eb8f0",
  storageBucket: "assistenciatech-eb8f0.appspot.com",
  messagingSenderId: "85885286294",
  appId: "1:85885286294:web:04ae5c99aaef51d0edcfb7",
  measurementId: "G-ZKMPL54LVG"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
