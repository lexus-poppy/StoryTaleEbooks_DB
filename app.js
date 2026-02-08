// ########################################
// ########## SETUP

// Express
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 55902;

// Database connection
const db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars');
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// ########################################
// ########## ROUTE HANDLERS (READ-ONLY FOR STEP 3)

app.get('/', async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('Error rendering page.');
    }
});

app.get('/members', async (req, res) => {
    try {
        const queryMembers = `
            SELECT memberID, firstName, lastName, email, phoneNumber
            FROM members
            ORDER BY lastName ASC;
        `;

        const queryMembers2 = `
            SELECT *
            FROM members;
        `;

        // Execute queries
        const [members] = await db.query(queryMembers);
        const [members2] = await db.query(queryMembers2);

        // Render page and pass data
        res.render('members', {
            members: members,
            members2: members2
        });

    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).send('Database error while retrieving members.');
    }
});

// ########################################
// ########## MEMBER CRUD ROUTES
// ########################################


// CREATE MEMBER  (POST /members)
app.post('/members', async (req, res) => {
    try {
        const query = `
            INSERT INTO Members (firstName, lastName, phoneNumber, email)
            VALUES (?, ?, ?, ?);
        `;

        const params = [
            req.body.firstName,
            req.body.lastName,
            req.body.phoneNumber,
            req.body.email
        ];

        await db.query(query, params);
        res.redirect('/members');

    } catch (error) {
        console.error("Error inserting member:", error);
        res.status(500).send("Failed to create member.");
    }
});



// UPDATE MEMBER (PUT /members/:id)
app.put('/members/:id', async (req, res) => {
    try {
        const query = `
            UPDATE Members
            SET phoneNumber = ?, email = ?
            WHERE memberID = ?;
        `;

        const params = [
            req.body.phoneNumber,
            req.body.email,
            req.params.id
        ];

        await db.query(query, params);

        res.json({ success: true });

    } catch (error) {
        console.error("Error updating member:", error);
        res.status(500).send("Failed to update member.");
    }
});



// DELETE MEMBER (DELETE /members/:id)
app.delete('/members/:id', async (req, res) => {
    try {
        const query = `
            DELETE FROM Members
            WHERE memberID = ?;
        `;

        await db.query(query, [req.params.id]);

        res.json({ success: true });

    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).send("Failed to delete member.");
    }
});


// ########################################
// ########## LISTENER

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

// Citation
// Date: 2/01/2026
// Adapted from:
// https://canvas.oregonstate.edu/courses/2031764/pages/exploration-overview-of-the-web-application-development-process?module_item_id=26243420
