-- ########################################
-- ######    MEMBER CRUD            #######
-- ########################################

-- CREATE
INSERT INTO Members (firstName, lastName, phoneNumber, email)
VALUES (:fNameInput, :lNameInput, :phoneInput, :emailInput);

-- READ
SELECT *
FROM Members;

-- UPDATE
UPDATE Members
SET firstName = :fNameInput, lastName = :lNameInput, phoneNumber = :phoneInput, email = :emailInput
WHERE memberID = :memberID_from_frontend;

-- DELETE
DELETE FROM Members
WHERE memberID = :memberID_from_frontend;

-- ########################################
-- ######     BOOKS CRUD            #######
-- ########################################

-- CREATE
INSERT INTO Books (ISBN, title, author, publisher, publishedDate, genre)
VALUES (:isbnInput, :titleInput, :authorInput, :publisherInput, :dateInput, :genreInput);

-- READ
SELECT *
FROM Books;

-- UPDATE
UPDATE Books
SET title = :titleInput, author = :authorInput, publisher = :publisherInput, publishedDate = :dateInput, genre = :genreInput
WHERE ISBN = :isbnInput

-- DELETE
DELETE FROM Books
WHERE ISBN = :isbnInput;

-- ########################################
-- ######     COUPONS CRUD          #######
-- ########################################

-- CREATE
INSERT INTO Coupons (couponDiscount, expirationDate)
VALUES (:discountInput, :expiryInput)

-- READ
SELECT *
FROM Coupons;

-- UPDATE
UPDATE Coupons
SET couponDiscount = :discountInput, expirationDate = :expiryInput
WHERE couponID = :couponID;

-- DELETE
DELETE FROM Coupons
WHERE couponID = :couponID;

-- ########################################
-- ######     ORDERS CRUD           #######
-- ########################################

-- CREATE
INSERT INTO Orders (totalPrice, couponID, memberID)
VALUES (:totalPriceInput, :couponID_from_dropdown, :memberID_from_dropdown);

-- READ
SELECT Orders.orderID, Members.firstName, Members.lastName, Coupons.couponDiscount, Orders.totalPrice
FROM Orders
JOIN Members ON Orders.memberID = Members.memberID
LEFT JOIN Coupons ON Orders.couponID = Coupons.couponID;

-- UPDATE
UPDATE Orders
SET totalPrice = :totalPriceInput
WHERE orderID = :orderID;

-- DELETE
DELETE FROM BooksAndOrders
WHERE orderID = :orderID_from_frontend;

DELETE FROM Orders
WHERE orderID = :orderID_from_frontend;

-- ########################################
-- ######    BOOKS AND ORDERS CRUD  #######
-- ########################################

-- CREATE
INSERT INTO BooksAndOrders (ISBN, orderID, QTY)
VALUES (:isbn_from_dropdown, :orderID_from_frontend, :qtyInput);

-- READ
SELECT BooksAndOrders.booksAndOrdersID, BooksAndOrders.orderID, Books.title, Books.ISBN, BooksAndOrders.QTY, Orders.totalPrice
FROM BooksAndOrders
JOIN Books ON BooksAndOrders.ISBN = Books.ISBN
JOIN Orders ON BooksAndOrders.orderID = Orders.orderID;

-- UPDATE
UPDATE BooksAndOrders
SET QTY = :qtyInput
WHERE booksAndOrdersID = :booksAndOrdersID;

-- DELETE
DELETE FROM BooksAndOrders
WHERE booksAndOrdersID = :booksAndOrdersID;



--        Citation for use of AI Tools:
--        Date: 02/11/2026
--        Prompts used to generate CRUD.sql content
--        Add Joins to Orders and BooksAndOrders that work with the Handlebars files
--        Fix this CRUD.sql file so that all of the variable names match all of the variables in the handlebars files and app.js file
--        AI Source URL: https://github.com/copilot?utm_campaign=copilot-brand&utm_medium=sem&utm_source=google&ocid=AIDcmmh2h80ugd_SEM__k_Cj0KCQiA7rDMBhCjARIsAGDBuEBD7rM6foqE_BsmLK2EynZLqQYBBDbyXJEvXpFu7Q90l-IZq94r6IoaAsEbEALw_wcB_k_
--        Links to an external site.
