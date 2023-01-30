const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.dbURL,
  bucket: "dog-search-17ece.appspot.com",
});

//initialize firestore
const db = admin.firestore();
//initialize auth
const auth = admin.auth();

module.exports = { admin, db, auth };
