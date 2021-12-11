const express = require('express');
const session = require('express-session');
const path = require('path');

const mainRoutes = require('./routes');

const app = express();
const methodOverride = require('method-override');

app.use(express.static(path.resolve(__dirname, '../public')));
app.use(session({
    secret: "¡Es secreto!",
    resave: false,
    saveUninitialized: false,
}));

app.set('views', path.resolve(__dirname, './views'));
app.set('view engine', 'ejs');

//para poder traer datos de los formularios
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'))

// GET the main routes
app.use('/', mainRoutes);

module.exports = app;
