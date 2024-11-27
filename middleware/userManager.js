// Funzione per eseguire l'hashing della password usando SHA-256
async function hashPassword(password) {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256");
    hash.update(password);
    return hash.digest("hex");
}

/* REQUIRE */
const { MongoClient } = require("mongodb");

/* CONNESSIONE DB */
const conn = new MongoClient("mongodb://localhost:27017");
const database = conn.db("rizza");
const users = database.collection("users");

// Middleware per verificare se l'utente è loggato
const checkSession = (req, res, next) => {
    if (req.session.username) next();
    else res.redirect("/login");
};

// Funzione per creare un nuovo utente
const create = async (req, res, next) => {
    const { username, password, nome, cognome } = req.body;
    if (!await getUser(username)) {
        const hashedPassword = await hashPassword(password);
        const data = { username, password: hashedPassword, nome, cognome };
        await users.insertOne(data);
        next();
    } else {
        res.render('register', { error: "User already exists" });
    }
};

// Funzione per il login
const login = async (req, res, next) => {
    const { username, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await users.findOne({ username });
    if (user && user.password === hashedPassword) {
        req.session.username = username;
        next();
    } else {
        res.render('login', { error: user ? "Password incorrect" : "User doesn't exist" });
    }
};

// Funzione per ottenere un utente per username
const getUser = async (username) => {
    return await users.findOne({ username });
};

// Funzione per aggiornare la password dell'utente
const updateUser = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).send("Passwords do not match.");
    const username = req.session.username;
    const user = await getUser(username);
    if (user.password !== await hashPassword(oldPassword)) return res.status(400).send("Incorrect old password.");
    const hashedPassword = await hashPassword(newPassword);
    await users.updateOne({ username }, { $set: { password: hashedPassword } });
    next();
};

// Funzione per eliminare l'utente
const deleteUser = async (req, res, next) => {
    const username = req.session.username;
    await users.deleteOne({ username });
    next();
};

module.exports = { checkSession, create, login, getUser, updateUser, deleteUser };
