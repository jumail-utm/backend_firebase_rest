# Developing REST API Service on Firebase

To follow this tutorial, make sure the emulators is already up and running on your local machine.

## Test the Emulator for Firebase Functions

**File: `./functions/index.js`**

```javascript
const functions = require("firebase-functions");

exports.hello = functions.https.onRequest((req, res) => {
  res.json({ message: "Hello World from Firebase function" });
});

exports.hi = functions.https.onRequest((req, res) => {
  res.json({ message: "Hi there. Greeting from Firebase" });
});
```

Run the function from a web browser. Replace `your-project-id` with your own

- http://localhost:5001/your-project-id/us-central1/hello
- http://localhost:5001/your-project-id/us-central1/hi

## Add Express JS for Routing

**File: `./functions/index.js`**

```javascript
const functions = require("firebase-functions");
const express = require("express");

const app = express();

app.get("/", (req, res, next) =>
  res.json({ message: "Firebase function service is working" })
);
app.get("/todos", (req, res, next) =>
  res.json({ message: "Get a list of todos" })
);

exports.api = functions.https.onRequest(app);
```

Run the function from a web browser.

[http://localhost:5001/your-project-id/us-central1/api](http://localhost:5001/your-project-id/us-central1/api)

[http://localhost:5001/your-project-id/us-central1/api/hello](http://localhost:5001/your-project-id/us-central1/api/todos)

## Define a Wrapper class for Database Connection

**File: `./functions/api/database.js`**

```javascript
// This class is a wrapper for database connection. It centeralizes generic CRUD operations.
// Here, we are implementing the Database class with Singleton design pattern
//  Singleton is a design pattern where we create only a single instance (or object) from a class

class Database {
  constructor() {
    if (this.instance) return this.instance; // This is the key idea of implementing singleton. Return the same instance (i.e. the one that has already been created before)

    // We only proceedd to the following lines only if no instance has been created from this class
    Database.instance = this;

    const admin = require("firebase-admin"); // To access Firestore API

    // Since the functions and firestore run on the same server,
    //  we can simply use default credential.
    // However, if your app run different location, you need to create a JSON Firebase credentials

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

    this.firestore = admin.firestore();
  }

  // Define some helper methods for CRUD operations
  // Note that, each firestore function call is asynchronous.
  //  Thus, you want to use the 'await' keyword at the caller.

  async create(collection, document) {
    const result = await this.firestore.collection(collection).add(document);
    document.id = result.id;
    return document;
  }

  async getList(collection) {
    const result = await this.firestore.collection(collection).get();

    const list = [];
    result.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      list.push(data);
    });
    return list.length ? list : null;
  }

  async get(collection, id) {
    const result = await this.firestore.collection(collection).doc(id).get();
    if (!result.exists) return null; // Record not found

    const doc = result.data();
    doc.id = result.id;
    return doc;
  }

  async set(collection, id, document) {
    const doc = this.firestore.collection(collection).doc(id);
    const result = await doc.get();

    if (!result.exists) return null; // Record not found

    await doc.set(document);

    document.id = id;
    return document;
  }

  async delete(collection, id) {
    const doc = this.firestore.collection(collection).doc(id);
    const result = await doc.get();

    if (!result.exists) return null; // Record not found

    await doc.delete();

    return { id };
  }
}

module.exports = new Database();
```

Test out the wrapper class in `index.js`

**File: `./functions/index.js`**

```javascript
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const db = require("./api/database");

app.get("/", (req, res, next) =>
  res.json({ message: "Firebase function service is working" })
);
app.get("/todos", (req, res, next) =>
  res.json({ message: "Get a list of todos" })
);

app.get("/newuser/:name", async (req, res, next) => {
  const name = req.params.name;
  const user = { name: name };
  const result = await db.create("users", user);
  user.id = result.id;
  return res.json(user);
});

app.get("/deleteuser/:id", async (req, res, next) => {
  const userId = req.params.id;
  const result = await db.delete("users", userId);
  console.log(result);
  return res.json(userId);
});

exports.api = functions.https.onRequest(app);

// To handle "Function Timeout" exception
exports.functionsTimeOut = functions.runWith({
  timeoutSeconds: 300,
});
```

## Upload Stock Data to Database

In case you want to initialize your database with some stock data, you can do it by creating a script as shown here.

- Create your script file in `./functions/`
- Export the function in `index.js`

**File: `./functions/setup_database.js`**

```javascript
const db = require("../functions/api/database");

async function setupDatabase(req, res, next) {
  // To delete all the collections
  const collections = ["users", "todos"];
  collections.forEach(async (collection) => await deleteCollection(collection));

  // Add documents to the todos collection
  addDocuments("todos", [
    { title: "Prepare proposal for the new project", completed: true },
    { title: "Replace light bulb", completed: true },
    { title: "Buy Flutter eBook", completed: false },
    { title: "Subscribe to Fibre optic internet service", completed: false },
    { title: "Setup online meeting room", completed: true },
  ]);

  res.send("Setting Up Database.... Done ");
}

async function deleteCollection(collection) {
  const cref = db.firestore.collection(collection);
  const docs = await cref.listDocuments();
  docs.forEach((doc) => doc.delete());
}

function addDocuments(collection, docs) {
  docs.forEach((doc) => db.create(collection, doc));
}

module.exports = setupDatabase;
```

Export the function in `index.js`. Add the following line at the bottom.

**File: `./functions/index.js`**

```javascript
// Add the following line. It should only be used temporarily. In production mode, it should be commented out,
exports.setupdb = functions.https.onRequest(require("./setup_database"));
```

Run the function from a web browser. Replace `your-project-id` with your own

- http://localhost:5001/your-project-id/us-central1/setupdb

## Define Model Classes

### File: `./functions/api/models/todos_model.js`

```javascript
const database = require("../database");

// Here, we are implementing the class with Singleton design pattern

class TodoModel {
  constructor() {
    if (this.instance) return this.instance;
    TodoModel.instance = this;
  }

  get() {
    return database.getList("todos");
  }

  getById(id) {
    return database.get("todos", id);
  }

  create(todo) {
    return database.create("todos", todo);
  }

  delete(id) {
    return database.delete("todos", id);
  }

  update(id, todo) {
    return database.set("todos", id, todo);
  }
}

module.exports = new TodoModel();
```

## Define Controller Classes

### File: `./functions/api/controllers/todos_controller.js`

```javascript
const todosModel = require("../models/todos_model");
const express = require("express");
const router = express.Router();

// Get all todos
router.get("/", async (req, res, next) => {
  try {
    const result = await todosModel.get();
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

// Get one todo
router.get("/:id", async (req, res, next) => {
  try {
    const result = await todosModel.getById(req.params.id);
    if (!result) return res.sendStatus(404);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

// Create a new todo
router.post("/", async (req, res, next) => {
  try {
    const result = await todosModel.create(req.body);
    if (!result) return res.sendStatus(409);
    return res.status(201).json(result);
  } catch (e) {
    return next(e);
  }
});

// Delete a todo
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await todosModel.delete(req.params.id);
    if (!result) return res.sendStatus(404);
    return res.sendStatus(200);
  } catch (e) {
    return next(e);
  }
});

// Update a todo
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const doc = await todosModel.getById(id);
    if (!doc) return res.sendStatus(404);

    // Merge existing fields with the ones to be updated
    Object.keys(data).forEach((key) => (doc[key] = data[key]));

    const updateResult = await todosModel.update(id, doc);
    if (!updateResult) return res.sendStatus(404);

    return res.json(doc);
  } catch (e) {
    return next(e);
  }
});

// Replace a todo
router.put("/:id", async (req, res, next) => {
  try {
    const updateResult = await todosModel.update(req.params.id, req.body);
    if (!updateResult) return res.sendStatus(404);

    const result = await todosModel.getById(req.params.id);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
```

## Finalize the Main Program

### File: `./functions/index.js`

```javascript
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const todosRouter = require("./api/controllers/todos_controller");

app.use(express.json());
app.use("/todos", todosRouter);

exports.api = functions.https.onRequest(app);

// To handle "Function Timeout" exception
exports.functionsTimeOut = functions.runWith({
  timeoutSeconds: 300,
});

// exports.setupdb = functions.https.onRequest(require('./setup_database'))
```

## Deploy the Project to Firebase

Before proceeding, make sure you have alreday created a live **Firebase project** and enabled **Firestore** database on it.

You may also want to stop the Firebase Emulator. Simply close the terminal where the emulator is currently running.

```bash
# Login to firebase (if you haven't already done)
$ firebase login

# Check whether you have linked your local project to live Firebase project. If so, you should see the label "(current)" in your project ID
$ firebase projects:list

# Link the local project with live Firebase project (if you haven't already done)
$ firebase init

# Deploy the project to Firebase
$ firebase deploy

# If you get errors, try deploying individually
$ firebase deploy --only functions
$ firebase deploy --only firestore
```

Once completed, verify the deployment from the [Firebase console](https://console.firebase.google.com/).

## Test the REST API server

- Test with REST Client to test the API server

  - [Sample REST requests](https://github.com/jumail-utm/backend_firebase_rest/dev/rest_client/requests.rest)

- Test with Flutter app
  - [Sample project](https://github.com/jumail-utm/flutter_todo_rest)
