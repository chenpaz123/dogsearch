const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.dbURL,
});

//initialize firestore
const db = admin.firestore();

module.exports = { admin, db };
