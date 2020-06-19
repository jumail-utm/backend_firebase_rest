const functions = require("firebase-functions");
const express = require("express");

const app = express();

app.get('/', (req, res, next) => res.json({ message: 'Firebase function service is working' }));
app.get('/todos', (req, res, next) => res.json({ message: 'Get a list of todos' }));

exports.api = functions.https.onRequest(app);