const functions = require('firebase-functions')
const db = require('./api/database')
const express = require("express");
const app = express();

app.get('/', (req, res, next) => res.json({ message: 'Firebase function service is working' }));
app.get('/todos', (req, res, next) => res.json({ message: 'Get a list of todos' }));

app.get('/newuser/:name', async (req, res, next) => {
    const name = req.params.name
    const user = { name: name }
    const result = await db.create('users', user)
    user.id = result.id
    return res.json(user)
});

app.get('/deleteuser/:id', async (req, res, next) => {
    const userId = req.params.id
    const result = await db.delete('users', userId)
    console.log(result)
    return res.json(userId)
});

exports.api = functions.https.onRequest(app)

// To handle "Function Timeout" exception
exports.functionsTimeOut = functions.runWith({
    timeoutSeconds: 300
})

// exports.setupdb = functions.https.onRequest(require('../.ignore/setup_database'))
