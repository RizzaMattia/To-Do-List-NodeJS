/* REQUIRE */
const express = require("express");

// Crea un'istanza del router di Express
const router = express.Router();

/* MIDDLEWARE */
const { registerValidate, loginValidate, addNoteValidate } = require("./middleware/formValidate");
const { checkSession, create, login, getUser, updateUser, deleteUser } = require("./middleware/userManager");
const {
    addNoteToCollection,
    getAllNotesFromCollection,
    getNoteByIdFromCollection,
    deleteNoteFromCollection,
    deleteAllNotes,
    completeNoteInCollection
} = require("./middleware/noteManager");

/* ROUTE */

// Route per visualizzare la pagina di login
router.get("/login", (req, res) => {
    res.render("login");
});

// Route per gestire il login (POST)
router.post("/login", [loginValidate, login], (req, res) => {
    res.redirect("/");
});

// Route per visualizzare la pagina di registrazione
router.get("/register", (req, res) => {
    res.render("register");
});

// Route per gestire la registrazione (POST)
router.post("/register", [registerValidate, create], (req, res) => {
    res.redirect('/login');
});

// Route per visualizzare la home dell'utente
router.get("/", [checkSession], async (req, res) => {
    try {
        // Ottieni tutte le note dell'utente dalla collezione "notes"
        const notes = await getAllNotesFromCollection(req.session.username, "notes");
        // Ottieni i dettagli dell'utente
        const user = await getUser(req.session.username);
        const username = user.nome;

        // Recupera il messaggio di successo dalla sessione, se presente
        const successMessage = req.session.successMessage || null;
        // Rimuove il messaggio di successo dalla sessione
        delete req.session.successMessage;


        res.render("home", { notes, username, successMessage });

    } catch (error) {
        // In caso di errore, renderizza la home con un array di note vuoto
        res.render("home", { notes: [] });
    }
});

// Route per visualizzare le note completate (passate)
router.get("/past", [checkSession], async (req, res) => {
    try {
        // Ottieni tutte le note completate dalla collezione "past"
        const pastNotes = await getAllNotesFromCollection(req.session.username, "past");

        // Recupera il messaggio di successo dalla sessione, se presente
        const successMessage = req.session.successMessage || null;
        delete req.session.successMessage;


        res.render("pastNotes", { notes: pastNotes, successMessage });

    } catch (error) {
        // In caso di errore, renderizza la vista con un array di note vuoto
        res.render("pastNotes", { notes: [] });
    }
});

// Route per visualizzare i dettagli di una singola nota
router.get("/note/:id", [checkSession], async (req, res) => {
    const { id } = req.params;
    try {
        // Ottieni la nota dalla collezione "notes" usando l'ID
        const note = await getNoteByIdFromCollection(id, "notes");

        res.render("noteDetails", { note });
    } catch (error) {
        // In caso di errore, reindirizza alla home con un array di note vuoto
        res.render("home", { notes: [] });
    }
});

// Route per visualizzare i dettagli di una nota completata
router.get("/past/note/:id", [checkSession], async (req, res) => {
    const { id } = req.params;
    try {
        // Ottieni la nota completata dalla collezione "past"
        const note = await getNoteByIdFromCollection(id, "past");
        if (note) {
            res.render("pastNoteDetails", { note });
        }
    } catch (error) {
        // In caso di errore, reindirizza alla home con un array di note vuoto
        res.render("home", { notes: [] });
    }
});

// Route per eliminare una singola nota
router.post("/note/delete/:id", [checkSession], async (req, res) => {
    const { id } = req.params;
    try {
        // Elimina la nota dalla collezione "notes"
        const result = await deleteNoteFromCollection(id, "notes");
        // Imposta un messaggio di successo nella sessione
        req.session.successMessage = 'Note deleted Successfully';

        res.redirect("/");
    } catch (error) {
        // In caso di errore, reindirizza alla vista "pastNotes" con un array vuoto
        res.render("pastNotes", { notes: [] });
    }
});

// Route per eliminare una nota dalla collezione "past"
router.post("/past/note/delete/:id", [checkSession], async (req, res) => {
    const { id } = req.params;
    try {
        // Elimina la nota dalla collezione "past"
        await deleteNoteFromCollection(id, "past");
        // Imposta il messaggio di successo per l'eliminazione
        req.session.successMessage = 'Note deleted Successfully';

        res.redirect("/past");
    } catch (error) {
        // In caso di errore, reindirizza alla vista "pastNotes"
        res.render("pastNotes", { notes: [] });
    }
});

// Route per segnare una nota come completata (spostarla nella collezione "past")
router.post("/note/complete/:id", [checkSession], async (req, res) => {
    const { id } = req.params;
    try {
        // Sposta la nota dalla collezione "notes" a "past"
        await completeNoteInCollection(id, "notes", "past");
        // Imposta il messaggio di successo
        req.session.successMessage = 'Note completed Successfully';

        res.redirect("/");
    } catch (error) {
        // In caso di errore, reindirizza alla home
        res.render("home", { notes: [] });
    }
});

// Route per visualizzare la pagina per aggiungere una nuova nota
router.get("/add", (req, res) => {
    res.render("add");
});

// Route per aggiungere una nuova nota (POST)
router.post("/add", [checkSession, addNoteValidate], async (req, res) => {
    const { title, description } = req.body;
    try {
        // Aggiungi la nota alla collezione "notes" dell'utente
        await addNoteToCollection(req.session.username, title, description, "notes");
        // Imposta un messaggio di successo per l'aggiunta
        req.session.successMessage = 'Note added Successfully!';

        res.redirect("/");
    } catch (error) {
        // In caso di errore, reindirizza alla home con un array di note vuoto
        res.render("home", { notes: [] });
    }
});

// Route per visualizzare il profilo dell'utente
router.get("/profile", [checkSession], async (req, res) => {
    try {
        // Recupera i dettagli dell'utente dalla sessione o dal database
        const user = await getUser(req.session.username);
        // Passa i dettagli dell'utente alla vista "profile"
        res.render("profile", { user });
    } catch (error) {
        // In caso di errore, reindirizza alla home
        res.render("home", { notes: [] });
    }
});

// Route per aggiornare la password dell'utente
router.post("/profile/update-password", [checkSession, updateUser], async (req, res) => {
    // Imposta il messaggio di successo per l'aggiornamento della password
    req.session.successMessage = 'Password updated Successfully!';
    res.redirect("/");
});

// Route per eliminare l'account dell'utente
router.post("/profile/delete-account", [deleteAllNotes, deleteUser], async (req, res) => {
    res.redirect("/logout");
});

// Route per effettuare il logout
router.get("/logout", [checkSession], (req, res) => {
    // Distrugge la sessione dell'utente
    req.session.destroy((err) => {
        if (err) {
            console.error("Errore nel distruggere la sessione:", err);
            return res.status(500).send("Errore nel logout");
        }

        res.redirect("/login");
    });
});


module.exports = router;
