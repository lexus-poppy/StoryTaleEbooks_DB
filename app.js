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
const db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars');
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// ########################################
// ########## HOME

app.get('/', (req, res) => {
    res.render('home');
});


// ########################################
// ########## MEMBERS CRUD
// ########################################

// READ
app.get('/members', (req, res) => {
    let query = `
        SELECT memberID, firstName, lastName, phoneNumber, email
        FROM Members
        ORDER BY lastName ASC;
    `;

    db.pool.query(query, (error, rows) => {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            res.render('members', { members: rows });
        }
    });
});

// CREATE MEMBER
app.post('/members', async (req, res) => {
    try {
        const { fNameInput, lNameInput, phoneInput, emailInput } = req.body;
        const query = `CALL sp_CreateMember(?, ?, ?, ?, @new_memberID);`;
        await db.pool.execute(query, [fNameInput, lNameInput, phoneInput, emailInput]);
        res.redirect('/members');
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).send('An error occurred while creating the member.');
    }
});

// UPDATE ROUTES
app.post('/members/update', async function (req, res) {
    try {
        const data = req.body;

        // MATCH THESE TO THE 'name' ATTRIBUTES IN YOUR .HBS FILE
        const memberID = data.update_member_id;
        const firstName = data.update_member_firstName;
        const lastName = data.update_member_lastName;
        const phone = data.update_member_phoneNumber;
        const email = data.update_member_email;

        // 1. Execute the stored procedure
        const query1 = 'CALL sp_UpdateMember(?, ?, ?, ?, ?);';
        
        // Use db.pool.query or db.pool.promise().query depending on your mysql2 setup
        // If using the standard callback pool provided in the OSU starter:
        db.pool.query(query1, [memberID, firstName, lastName, phone, email], (error, rows) => {
            if (error) {
                console.error('Error updating member:', error);
                res.status(500).send('Database error');
            } else {
                console.log(`Successfully updated Member ID: ${memberID}`);
                res.redirect('/members');
            }
        });

    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send('An error occurred while executing the database queries.');
    }
});

// DELETE MEMBERS ROUTE
app.post('/members/delete', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;

        // Use the new stored procedure created in the previous step
        const query1 = `CALL sp_DeleteMember(?);`;
        
        // Ensure data.delete_member_id matches the 'name' attribute in your .hbs form
        await db.query(query1, [data.delete_member_id]);

        console.log(`DELETE Member.memberID: ${data.delete_member_id}`);

        // Redirect back to the members page to see the updated list
        res.redirect('/members');
    } catch (error) {
        console.error('Error executing delete query:', error);
        
        // Providing a slightly more descriptive error for debugging
        res.status(500).send(
            'An error occurred while deleting the member. ' + 
            'They may be linked to active orders that cannot be removed.'
        );
    }
});

// ########################################
// ########## BOOKS CRUD
// ########################################

// READ
app.get('/books', (req, res) => {
    let query = `
        SELECT ISBN as isbn, title, author, publisher, publishedDate, genre
        FROM Books;
    `;

    db.pool.query(query, (error, rows) => {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            res.render('books', { books: rows });
        }
    });
});

// CREATE BOOK ROUTE
app.post('/books', async function (req, res) {
    try {
        // Parse frontend form information from books.hbs
        let data = req.body;

        // Cleanse data - Handle optional fields (Publisher and Date)
        let publisher = data.publisherInput || null;
        let publishedDate = data.publishedDateInput || null;

        // Use the parameterized query to call the stored procedure
        const query1 = `CALL sp_CreateBook(?, ?, ?, ?, ?, ?);`;

        // Execute the procedure
        // Note: Using [ [[rows]] ] to destructure the result set from the procedure call
        const [result] = await db.query(query1, [
            data.isbnInput,
            data.titleInput,
            data.authorInput,
            publisher,
            publishedDate,
            data.genreInput
        ]);

        // Procedures return a nested array; the first index contains our 'new_isbn' select
        const newIsbn = result[0][0].new_isbn;

        console.log(`CREATE Book. ISBN: ${newIsbn} Title: ${data.titleInput}`);

        // Redirect the user back to the books page to see the new entry
        res.redirect('/books');

    } catch (error) {
        console.error('Error executing sp_CreateBook:', error);
        
        // Handle common errors (like duplicate ISBN)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Error: A book with this ISBN already exists.');
        } else {
            res.status(500).send('An error occurred while creating the book.');
        }
    }
});

// UPDATE BOOK ROUTE
app.post('/books/update', async function (req, res) {
    try {
        // Parse frontend form information from books.hbs
        const data = req.body;

        // Cleanse data - Handle optional fields (Publisher and Date)
        // If they are empty strings from the form, set them to null for the database
        let publisher = data.publisherInput || null;
        let publishedDate = data.publishedDateInput || null;

        // Create and execute our queries
        const queryUpdate = 'CALL sp_UpdateBook(?, ?, ?, ?, ?, ?);';
        const querySelect = 'SELECT title FROM Books WHERE ISBN = ?;';

        // 1. Execute the update procedure
        await db.query(queryUpdate, [
            data.isbnInput,
            data.titleInput,
            data.authorInput,
            publisher,
            publishedDate,
            data.genreInput
        ]);

        // 2. Fetch the title for the console log confirmation
        const [[rows]] = await db.query(querySelect, [data.isbnInput]);

        console.log(`UPDATE Books. ISBN: ${data.isbnInput} Title: ${rows.title}`);

        // Redirect the user back to the books page
        res.redirect('/books');

    } catch (error) {
        console.error('Error executing sp_UpdateBook:', error);
        res.status(500).send(
            'An error occurred while updating the book records.'
        );
    }
});

// DELETE BOOK ROUTE
app.post('/books/delete', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;
        
        // Use the ISBN provided in the request body
        const isbnToDelete = data.isbnInput;

        // Execute the stored procedure
        const query1 = `CALL sp_DeleteBook(?);`;
        await db.query(query1, [isbnToDelete]);

        console.log(`DELETE Book. ISBN: ${isbnToDelete}`);

        // Redirect back to the books page to show the updated list
        res.redirect('/books');
    } catch (error) {
        console.error('Error executing delete query:', error);
        res.status(500).send(
            'An error occurred while deleting the book. Ensure it is not locked by another process.'
        );
    }
});


// ########################################
// ########## COUPONS CRUD
// ########################################

// READ
app.get('/coupons', (req, res) => {
    let query = `SELECT couponID, couponDiscount, expirationDate FROM Coupons`;

    db.pool.query(query, (error, rows) => {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            res.render('coupons', { coupons: rows });
        }
    });
});

// ROUTE FOR CREATING A COUPON
app.post('/add-coupon-form', async function (req, res) {
    try {
        const data = req.body;
        const query = 'CALL sp_CreateCoupon(?, ?, @new_couponID);';
        const [rows] = await db.query(query, [
        data.couponDiscountInput,
        data.expirationDateInput
    ]);
    res.redirect('/coupons');
} catch (error) {
    console.error(error);
    res.status(500).send('Error creating coupon');
    }
});

// ROUTE FOR UPDATING A COUPON
app.post('/coupons/update', async function (req, res) {
    try {
        const data = req.body;
        const query = 'CALL sp_UpdateCoupon(?, ?);';
        await db.query(query, [
        data.couponIDInput,
        data.expirationDateInput
    ]);
    res.redirect('/coupons');
} catch (error) {
    console.error(error);
    res.status(500).send('Error updating coupon');
    }
});

// DELETE COUPON ROUTE
app.post('/coupons/delete', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;
        
        // Use the couponID provided in the request body
        const couponIDToDelete = data.delete_coupon_id;

        // Execute the stored procedure
        const query1 = `CALL sp_DeleteCoupon(?);`;
        await db.query(query1, [couponIDToDelete]);

        console.log(`DELETE Coupon. ID: ${couponIDToDelete}`);

        // Redirect back to the coupons page to show the updated list
        res.redirect('/coupons');
    } catch (error) {
        console.error('Error executing delete query:', error);
        res.status(500).send(
            'An error occurred while deleting the coupon. Ensure it is not locked by another process.'
        );
    }
});
