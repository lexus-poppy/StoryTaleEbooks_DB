// ########################################
// ########## SETUP

// Express
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 55902;

// Database
const db = require("./database/db-connector");

// Handlebars
const { engine } = require("express-handlebars"); // Import express-handlebars engine
app.engine(".hbs", engine({ extname: ".hbs" })); // Create instance of handlebars
app.set("view engine", ".hbs"); // Use handlebars engine for *.hbs files.

// ########################################
// ########## ROUTE HANDLERS

// READ ROUTES
app.get("/", async function (req, res) {
    try {
        res.render("home"); // Render the home.hbs file
    } catch (error) {
        console.error("Error rendering page:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while rendering the page.");
    }
});

app.get("/bsg-people", async function (req, res) {
    try {
        // Create and execute our queries
        const query1 = `SELECT memberID, firstName, lastName, email, phoneNumber FROM members ORDER BY lastName ASC;`;
        const query2 = "SELECT * FROM members;";
        const [orders] = await db.query(query1);
        const [books] = await db.query(query2);

        res.render("members", { orders: orders, books: books });
    } catch (error) {
        console.error("Error executing queries:", error);
        // Send a generic error message to the browser
        res.status(500).send(
            "An error occurred while executing the database queries.",
        );
    }
});

app.get("/books", async function (req, res) {
    try {
        res.render("books"); // Render the books.hbs file
    } catch (error) {
        console.error("Error rendering page:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while rendering the page.");
    }
});

app.get("/coupons", async function (req, res) {
    try {
        res.render("coupons"); // Render the coupons.hbs file
    } catch (error) {
        console.error("Error rendering page:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while rendering the page.");
    }
});

app.get("/orders", async function (req, res) {
    try {
        res.render("orders"); // Render the orders.hbs file
    } catch (error) {
        console.error("Error rendering page:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while rendering the page.");
    }
});

app.get("/members", async function (req, res) {
    try {
        res.render("members"); // Render the members.hbs file
    } catch (error) {
        console.error("Error rendering page:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while rendering the page.");
    }
});

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(
        "Express started on http://localhost:" +
            PORT +
            "; press Ctrl-C to terminate.",
    );
});

// Citation for the following function:
// Date: 2/01/2026
// Copied from /OR/ Adapted from /OR/ Based on:
// Source URL: https://canvas.oregonstate.edu/courses/2031764/pages/exploration-overview-of-the-web-application-development-process?module_item_id=26243420
