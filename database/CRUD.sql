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


--        Citation for use of AI Tools:
--        Date: 02/11/2026
--        Prompts used to generate CRUD.sql content
--        Fix this CRUD.sql file so that all of the variable names match all of the variables in the handlebars files and app.js file
--        AI Source URL: https://github.com/copilot?utm_campaign=copilot-brand&utm_medium=sem&utm_source=google&ocid=AIDcmmh2h80ugd_SEM__k_Cj0KCQiA7rDMBhCjARIsAGDBuEBD7rM6foqE_BsmLK2EynZLqQYBBDbyXJEvXpFu7Q90l-IZq94r6IoaAsEbEALw_wcB_k_
--        Links to an external site.
