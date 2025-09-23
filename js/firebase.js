const firebaseConfig = {
  apiKey: "AIzaSyA-hH-p_WdZfMqCaShV4Fa43QEuTz8WCdY",
  authDomain: "hbdblessy.firebaseapp.com",
  projectId: "hbdblessy",
  storageBucket: "hbdblessy.firebasestorage.app",
  messagingSenderId: "933074410122",
  appId: "1:933074410122:web:7f9e9f640fbc5648e6ab73",
  measurementId: "G-R281081KYF"
};

firebase.initializeApp(firebaseConfig);

// This line creates the 'storage' variable that slith.js needs
const storage = firebase.storage();