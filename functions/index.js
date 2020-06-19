const functions = require("firebase-functions");

exports.hello = functions.https.onRequest((req, res) => {
    res.json({ message: "Hello World from Firebase function" });
});

exports.hi = functions.https.onRequest((req, res) => {
    res.json({ message: "Hi there. Greeting from Firebase" });
});