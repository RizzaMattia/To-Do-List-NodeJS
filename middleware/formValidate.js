// Middleware per validare i dati di registrazione
const registerValidate = (req, res, next) => {
    const { username, password, cpassword, nome, cognome } = req.body;

    // Verifica che tutti i campi siano compilati correttamente
    if (username && password && cpassword && nome && cognome &&
        username.trim() && password.trim() && cpassword.trim() && nome.trim() && cognome.trim()) {

        // Verifica se le password corrispondono
        if (password === cpassword) {
            next(); // Passa al prossimo middleware
        } else {
            res.render('register', { error: "Passwords do not match" }); // Mostra errore se le password non corrispondono
        }
    } else {
        res.render('register', { error: "Inputs not Correct" }); // Mostra errore se i campi non sono validi
    }
};

// Middleware per validare i dati di login
const loginValidate = (req, res, next) => {
    const { username, password } = req.body;

    // Verifica che i campi siano compilati correttamente
    if (username && password && username.trim() && password.trim()) {
        next(); // Passa al prossimo middleware
    } else {
        res.render('login', { error: "Inputs not Correct", username }); // Mostra errore se i campi non sono validi
    }
};

// Middleware per validare i dati per aggiungere una nota
const addNoteValidate = (req, res, next) => {
    const { title, description } = req.body;

    // Verifica che i campi titolo e descrizione siano compilati correttamente
    if (title && description && title.trim() && description.trim()) {
        next(); // Passa al prossimo middleware
    } else {
        res.render('add', { error: "Inputs not Correct" }); // Mostra errore se i campi non sono validi
    }
};

module.exports = { registerValidate, loginValidate, addNoteValidate };
