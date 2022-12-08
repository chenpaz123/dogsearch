const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.dbURL,
  bucket: "dog-search-17ece.appspot.com",
});
const db = admin.firestore();
//realtime database
const rtdb = admin.database();

module.exports = { admin, db };
