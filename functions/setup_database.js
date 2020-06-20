const db = require('./api/database')

async function setupDatabase(req, res, next) {
    // To delete all the collections
    const collections = ['users', 'todos']
    collections.forEach(async (collection) => await deleteCollection(collection))

    // Add documents to the todos collection
    addDocuments(
        'todos',
        [
            { title: 'Prepare proposal for the new project', completed: true },
            { title: 'Replace light bulb', completed: true },
            { title: 'Buy Flutter eBook', completed: false },
            { title: 'Subscribe to Fibre optic internet service', completed: false },
            { title: 'Setup online meeting room', completed: true }
        ]
    )

    res.send('Setting Up Database.... Done ')
}

async function deleteCollection(collection) {
    const cref = db.firestore.collection(collection)
    const docs = await cref.listDocuments()
    docs.forEach((doc) => doc.delete())
}

function addDocuments(collection, docs) {
    docs.forEach((doc) => db.create(collection, doc))
}

module.exports = setupDatabase