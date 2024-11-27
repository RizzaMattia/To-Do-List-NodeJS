/* REQUIRE */
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

/* CONNESSIONE DB */
const conn = new MongoClient("mongodb://localhost:27017");

/* COSTANTI */
const database = conn.db("rizza");
const notesCollection = database.collection("notes");
const pastCollection = database.collection("past");


/* FUNZIONI GENERICHE */

// Funzione generica per ottenere tutte le note da una collection
const getAllNotesFromCollection = async (username, collectionName) => {
    try {
        const collection = database.collection(collectionName);  // Ottieni la collection dinamicamente
        const notesList = await collection.find({ username: username }).toArray();  // Trova tutte le note
        return notesList;  // Restituisci le note
    } catch (error) {
        console.error(`Errore nel recupero delle note dalla collection ${collectionName}:`, error);
    }
};

// Funzione generica per ottenere una singola nota tramite l'id da una collection
const getNoteByIdFromCollection = async (id, collectionName) => {
    try {
        const collection = database.collection(collectionName);
        const note = await collection.findOne({ _id: new ObjectId(id) });
        return note;  // Restituisci la nota trovata
    } catch (error) {
        console.error(`Errore nel recupero della nota dalla collection ${collectionName}:`, error);
    }
};

// Funzione generica per inserire una nuova nota in una collection
const addNoteToCollection = async (username, title, description, collectionName) => {
    try {
        const collection = database.collection(collectionName);
        const data = {
            title: title,
            description: description,
            username: username,
            createdAt: new Date(),
        };
        const result = await collection.insertOne(data);  // Inserisci la nota
        return result;
    } catch (error) {
        console.error(`Errore nell'inserimento della nota nella collection ${collectionName}:`, error);;
    }
};

// Funzione generica per eliminare una nota da una collection
const deleteNoteFromCollection = async (id, collectionName) => {
    try {
        const collection = database.collection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });  // Elimina la nota
        return result;
    } catch (error) {
        console.error(`Errore nell'eliminazione della nota dalla collection ${collectionName}:`, error);
    }
};

const deleteAllNotes = async (req, res, next) => {
    try {
        const username = req.session.username;

        // Elimina tutte le note dalla collection "notes"
        const notesResult = await database.collection("notes").deleteMany({ username: username });

        // Elimina tutte le note dalla collection "past"
        const pastResult = await database.collection("past").deleteMany({ username: username });

        next();
    } catch (error) {
    }
};



// Funzione generica per completare una nota (spostarla in un'altra collection)
const completeNoteInCollection = async (id, fromCollectionName, toCollectionName) => {
    try {
        const fromCollection = database.collection(fromCollectionName);
        const toCollection = database.collection(toCollectionName);
        // Trova la nota dalla collection di partenza
        const note = await fromCollection.findOne({ _id: new ObjectId(id) });
        // Copia la nota nella collection di destinazione
        await toCollection.insertOne(note);

        // Elimina la nota dalla collection di partenza
        await fromCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
        console.error(`Errore nel completamento della nota dalla collection ${fromCollectionName} alla collection ${toCollectionName}:`, error);
    }
};

module.exports = {
    getAllNotesFromCollection,
    getNoteByIdFromCollection,
    addNoteToCollection,
    deleteNoteFromCollection,
    deleteAllNotes,
    completeNoteInCollection
};
