// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Replace with your service account JSON file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://animalapp-ce1e0.firebasestorage.app' // Replace with your Firebase storage bucket name
});

const bucket = admin.storage().bucket(); // Firebase Storage bucket
module.exports = { bucket };
