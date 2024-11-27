// Importa moduli e inizializza l'app
const express = require("express");
const session = require('express-session');
const hbs = require("hbs");
const router = require("./router");
const app = express();

// Configurazione delle sessioni
app.use(session({
    secret: 'Emma <3 Faul',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 3600000,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Configurazioni generali
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

// Configura il routing
app.use(router);

// Helper per troncare il testo
hbs.registerHelper('truncate', function (text) {
    if (text && text.length > 25) {
        return text.substring(0, 25) + '...';
    }
    return text;
});

// Avvia il server
app.listen("3000");
