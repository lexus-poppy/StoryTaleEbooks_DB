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
        SELECT ISBN as isbn, title, author, publisher, publishedDate, genre, bookCost
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
            data.genreInput,
            data.bookCostInput
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
            data.genreInput,
            data.bookCostInput
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


// ########################################
// ########## ORDERS CRUD
// ########################################

// READ
app.get('/orders', (req, res) => {
    let queryOrders = `
        SELECT Orders.orderID, Members.firstName, Members.lastName,
               Coupons.couponDiscount, Orders.totalPrice
        FROM Orders
        JOIN Members ON Orders.memberID = Members.memberID
        LEFT JOIN Coupons ON Orders.couponID = Coupons.couponID;
    `;

    let queryMembers = `SELECT memberID, firstName, lastName FROM Members`;
    let queryCoupons = `SELECT couponID, couponDiscount FROM Coupons`;

    db.pool.query(queryOrders, (err, orders) => {
        db.pool.query(queryMembers, (err, members) => {
            db.pool.query(queryCoupons, (err, coupons) => {
                res.render('orders', {
                    orders,
                    members,
                    coupons
                });
            });
        });
    });
});

// CREATE ORDER
app.post('/add-order-form', function (req, res) {
    let data = req.body;

    // 1. Force values to numbers. 
    // If "NULL" is selected, it becomes 0.
    let memberID = parseInt(data.memberIDInput) || null;
    let couponID = data.couponIDInput === "NULL" ? 0 : parseInt(data.couponIDInput);
    let totalPrice = parseFloat(data.totalPriceInput) || 0.00;

    // 2. Call the procedure
    let query = `CALL sp_CreateOrder(?, ?, ?)`;
    
    db.pool.query(query, [memberID, couponID, totalPrice], (error, rows) => {
        if (error) {
            console.error("!!! DATABASE ERROR !!!");
            console.error("Values attempted:", { memberID, couponID, totalPrice });
            console.error("Error Message:", error.sqlMessage);
            
            // This will show you exactly what failed in the browser
            res.status(500).send(`Database Error: ${error.sqlMessage}`);
        } else {
            res.redirect('/orders');
        }
    });
});

// UPDATE ORDER
app.post('/orders/update', function (req, res) {
    let data = req.body;

    // 1. Parse all inputs
    let orderID = parseInt(data.orderIDInput);
    let memberID = parseInt(data.memberIDInput);
    
    // 2. Critical Fix: Handle the "NULL" string from the dropdown
    let couponID = data.couponIDInput === "NULL" ? null : parseInt(data.couponIDInput);
    
    let totalPrice = parseFloat(data.totalPriceInput) || 0.00;

    // 3. Call Procedure with EXACTLY 4 arguments
    let query = `CALL sp_UpdateOrder(?, ?, ?, ?)`;

    db.pool.query(query, [orderID, memberID, couponID, totalPrice], (error, rows) => {
        if (error) {
            console.error("!!! DATABASE ERROR ON UPDATE:", error);
            // This sends the specific SQL error message to your browser for debugging
            res.status(500).send(error.sqlMessage); 
        } else {
            res.redirect('/orders');
        }
    });
});

// DELETE ORDER ROUTE
app.post('/orders/delete', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;
        
        // Use the orderID provided in the request body
        const orderIDToDelete = data.delete_order_id;

        // Execute the stored procedure
        const query1 = `CALL sp_DeleteOrder(?);`;
        await db.query(query1, [orderIDToDelete]);

        console.log(`DELETE Order. ID: ${orderIDToDelete}`);

        // Redirect back to the orders page to show the updated list
        res.redirect('/orders');
    } catch (error) {
        console.error('Error executing delete query:', error);
        res.status(500).send(
            'An error occurred while deleting the order. Ensure it is not locked by another process.'
        );
    }
});


// ########################################
// ########## BOOKS AND ORDERS (M:N)
// ########################################

// READ
app.get('/booksAndOrders', (req, res) => {
    // 1. All necessary queries
    let queryLineItems = `
        SELECT bao.booksAndOrdersID, bao.orderID, b.title, b.ISBN, bao.QTY
        FROM BooksAndOrders bao
        JOIN Books b ON bao.ISBN = b.ISBN;`;
    
    let queryBooks = `SELECT ISBN, title FROM Books;`;
    let queryMembers = `SELECT memberID, firstName, lastName FROM Members;`;
    let queryOrders = `SELECT orderID FROM Orders;`;
    let queryCoupons = `SELECT couponID, couponDiscount FROM Coupons;`;

    // 2. Nesting queries to gather all data
    db.pool.query(queryLineItems, (err, items) => {
        if (err) { console.log("LineItems Query Error:", err); return res.sendStatus(500); }

        db.pool.query(queryBooks, (err, books) => {
            if (err) { console.log("Books Query Error:", err); return res.sendStatus(500); }

            db.pool.query(queryMembers, (err, members) => {
                if (err) { console.log("Members Query Error:", err); return res.sendStatus(500); }

                db.pool.query(queryOrders, (err, orders) => {
                    if (err) { console.log("Orders Query Error:", err); return res.sendStatus(500); }

                    db.pool.query(queryCoupons, (err, coupons) => {
                        if (err) { console.log("Coupons Query Error:", err); return res.sendStatus(500); }

                        // 3. Render with specific keys
                        res.render('booksAndOrders', {
                            booksAndOrders: items,
                            books: books,
                            members: members,
                            orders: orders,
                            coupons: coupons
                        });
                    });
                });
            });
        });
    });
});

// CREATE
// This route name must match the 'action' in your HTML form exactly
app.post('/booksAndOrders/new-order', (req, res) => {
    let { memberID, ISBN, QTY, couponID } = req.body;

    console.log('POST /booksAndOrders/new-order body:', req.body);

    // Basic validation
    if (!memberID || !ISBN || !QTY || !couponID) {
        console.log("Missing data in new-order request body:", req.body);
        return res.status(400).send("Missing required fields: memberID, ISBN, QTY, couponID");
    }

    // Normalize types
    QTY = Number(QTY);
    couponID = Number(couponID);

    // Verify member exists
    let checkMember = `SELECT memberID FROM Members WHERE memberID = ?`;
    db.pool.query(checkMember, [memberID], (err, memberRows) => {
        if (err) {
            console.log('Error checking Members table for memberID:', err);
            return res.status(500).send('Server error checking memberID');
        }
        if (!memberRows || memberRows.length === 0) {
            console.log('MemberID not found:', memberID);
            return res.status(400).send('MemberID not found: ' + memberID);
        }

        // Verify book exists
        let checkBook = `SELECT ISBN FROM Books WHERE ISBN = ?`;
        db.pool.query(checkBook, [ISBN], (err2, bookRows) => {
            if (err2) {
                console.log('Error checking Books table for ISBN:', err2);
                return res.status(500).send('Server error checking ISBN');
            }
            if (!bookRows || bookRows.length === 0) {
                console.log('ISBN not found in Books table (new-order):', ISBN);
                return res.status(400).send('ISBN not found: ' + ISBN);
            }

            let createOrderQuery = `INSERT INTO Orders (memberID, totalPrice, couponID) VALUES (?, ?, ?)`;

            db.pool.query(createOrderQuery, [memberID, cost, couponID], (error, result) => {
                if (error) {
                    console.log("Error creating Order:", error);
                    return res.status(400).send('Database error creating order: ' + (error.message || error));
                }

                const newOrderID = result.insertId;

                let createLineItemQuery = `INSERT INTO BooksAndOrders (orderID, ISBN, QTY) VALUES (?, ?, ?)`;

                db.pool.query(createLineItemQuery, [newOrderID, ISBN, QTY], (error2) => {
                    if (error2) {
                        console.log("Error creating Line Item:", error2);
                        return res.status(400).send('Database error creating line item: ' + (error2.message || error2));
                    }
                    res.redirect('/booksAndOrders');
                });
            });
        });
    });
});

// POST: Add a book to an existing orderID
app.post('/booksAndOrders/existing-order', (req, res) => {
    let { orderID, ISBN, QTY } = req.body;

    let query = `INSERT INTO BooksAndOrders (orderID, ISBN, QTY) VALUES (?, ?, ?)`;

    db.pool.query(query, [orderID, ISBN, QTY], (error) => {
        if (error) {
            console.log("Error adding to existing order:", error);
            res.sendStatus(400);
        } else {
            res.redirect('/booksAndOrders');
        }
    });
});

// UPDATE BooksAndOrders Line Items
// (Already updated above)

// DELETE BooksAndOrders Line Item
app.delete('/booksAndOrders/:id', (req, res) => {
    let lineItemID = req.params.id;

    let query = `DELETE FROM BooksAndOrders WHERE booksAndOrdersID = ?`;

    db.pool.query(query, [lineItemID], (error, result) => {
        if (error) {
            console.log("Error deleting line item:", error);
            res.sendStatus(400);
        } else {
            // 204 No Content is the standard success response for DELETE
            res.sendStatus(204);
        }
    });
});

// ########################################
// ########## LISTENER

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
