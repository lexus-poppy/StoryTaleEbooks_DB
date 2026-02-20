-- #############################
-- CREATE members
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateMember;

DELIMITER //
CREATE PROCEDURE sp_CreateMember(
    IN p_firstName VARCHAR(255),
    IN p_lastName VARCHAR(255),
    IN p_phoneNumber VARCHAR(20),
    IN p_email VARCHAR(255),
    OUT p_memberID INT
)
BEGIN
    INSERT INTO Members (firstName, lastName, phoneNumber, email)
    VALUES (p_firstName, p_lastName, p_phoneNumber, p_email);

    -- Store the ID of the last inserted row
    SELECT LAST_INSERT_ID() INTO p_memberID;
    -- Display the ID of the last inserted member
    SELECT LAST_INSERT_ID() AS 'new_memberID';

    -- Example usage:
    -- CALL sp_CreateMember('John', 'Doe', '503-555-1234', 'john@example.com', @new_memberID);
    -- SELECT @new_memberID AS 'New Member ID';
END //
DELIMITER ;


-- #############################
-- UPDATE members
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateMember;

DELIMITER //
CREATE PROCEDURE sp_UpdateMember(
    IN p_memberID INT,
    IN p_firstName VARCHAR(255),
    IN p_lastName VARCHAR(255),
    IN p_phoneNumber VARCHAR(20),
    IN p_email VARCHAR(255)
)
BEGIN
    UPDATE Members
    SET firstName = p_firstName,
        lastName = p_lastName,
        phoneNumber = p_phoneNumber,
        email = p_email
    WHERE memberID = p_memberID;
END //
DELIMITER ;

-- #############################
-- DELETE Members
-- #############################
DROP PROCEDURE IF EXISTS sp_DeleteMember;

DELIMITER //
CREATE PROCEDURE sp_DeleteMember(IN p_memberID INT)
BEGIN
    DECLARE error_message VARCHAR(255); 

    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Roll back the transaction on any error
        ROLLBACK;
        -- Propagate the error message to the caller
        RESIGNAL;
    END;

    START TRANSACTION;
        -- Note: Because your DDL uses ON DELETE CASCADE on the Orders table,
        -- deleting from Members will automatically delete their Orders,
        -- which in turn deletes their BooksAndOrders entries.

        DELETE FROM Members WHERE memberID = p_memberID;

        -- ROW_COUNT() checks if the DELETE affected the Members table
        IF ROW_COUNT() = 0 THEN
            SET error_message = CONCAT('No matching record found in Members for memberID: ', p_memberID);
            -- Trigger custom error, invoking the EXIT HANDLER
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_message;
        END IF;

    COMMIT;
END //
DELIMITER ;

-- #############################
-- CREATE Books
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateBook;

DELIMITER //
CREATE PROCEDURE sp_CreateBook(
    IN p_ISBN VARCHAR(50),
    IN p_title VARCHAR(50),
    IN p_author VARCHAR(50),
    IN p_publisher VARCHAR(50),
    IN p_publishedDate DATE,
    IN p_genre VARCHAR(45)
)
BEGIN
    INSERT INTO Books (ISBN, title, author, publisher, publishedDate, genre)
    VALUES (p_ISBN, p_title, p_author, p_publisher, p_publishedDate, p_genre);

    -- Return the ISBN of the newly created book for confirmation
    SELECT p_ISBN AS 'new_isbn';
END //
DELIMITER ;


-- #############################
-- UPDATE Books
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateBook;

DELIMITER //
CREATE PROCEDURE sp_UpdateBook(
    IN p_ISBN VARCHAR(50),
    IN p_title VARCHAR(50),
    IN p_author VARCHAR(50),
    IN p_publisher VARCHAR(50),
    IN p_publishedDate DATE,
    IN p_genre VARCHAR(45)
)
BEGIN
    UPDATE Books 
    SET title = p_title, 
        author = p_author, 
        publisher = p_publisher, 
        publishedDate = p_publishedDate, 
        genre = p_genre 
    WHERE ISBN = p_ISBN;
END //
DELIMITER ;


-- #############################
-- DELETE Books
-- #############################
DROP PROCEDURE IF EXISTS sp_DeleteBook;

DELIMITER //
CREATE PROCEDURE sp_DeleteBook(IN p_isbn VARCHAR(50))
BEGIN
    DECLARE error_message VARCHAR(255); 

    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        -- Foreign Key CASCADE in your DDL handles BooksAndOrders entries automatically
        DELETE FROM Books WHERE ISBN = p_isbn;

        -- ROW_COUNT() checks if the book actually existed
        IF ROW_COUNT() = 0 THEN
            SET error_message = CONCAT('No matching record found in Books for ISBN: ', p_isbn);
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_message;
        END IF;

    COMMIT;
END //
DELIMITER ;

-- #############################
-- CREATE Coupons
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateCoupon;
DELIMITER //
CREATE PROCEDURE sp_CreateCoupon(
    IN p_discount DECIMAL(19,2),
    IN p_expiration DATE,
    OUT p_couponID INT
)
BEGIN
INSERT INTO Coupons (couponDiscount, expirationDate)
VALUES (p_discount, p_expiration);
SELECT LAST_INSERT_ID() AS 'new_couponID';
END //
DELIMITER ;

-- #############################
-- UPDATE Coupons
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateCoupon;
DELIMITER //
CREATE PROCEDURE sp_UpdateCoupon(
    IN p_couponID INT,
    IN p_expiration DATE
)
BEGIN
UPDATE Coupons
SET expirationDate = p_expiration
WHERE couponID = p_couponID;
END //
DELIMITER ;

-- #############################
-- DELETE Coupons
-- #############################
DROP PROCEDURE IF EXISTS sp_DeleteCoupon;

DELIMITER //
CREATE PROCEDURE sp_DeleteCoupon(IN p_couponID INT)
BEGIN
DECLARE error_message VARCHAR(255);

    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        DELETE FROM Coupons WHERE couponID = p_couponID;

        IF ROW_COUNT() = 0 THEN
            SET error_message = CONCAT('No matching record found in Coupons for couponID: ', p_couponID);
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_message;
        END IF;

    COMMIT;
END //
DELIMITER ;

-- #############################
-- CREATE Orders
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateOrder;

DELIMITER //
CREATE PROCEDURE sp_CreateOrder(
    IN p_memberID INT,
    IN p_couponID INT,
    IN p_totalPrice DECIMAL(19,2)
)
BEGIN
    -- This is the safety net: 
    -- If Node.js sends 0, empty string (casted to 0), or a failed NULL,
    -- this ensures the database attempts a literal NULL.
    IF p_couponID = 0 OR p_couponID IS NULL THEN
        SET p_couponID = NULL;
    END IF;

    INSERT INTO Orders (memberID, couponID, totalPrice)
    VALUES (p_memberID, p_couponID, p_totalPrice);
END //
DELIMITER ;

-- #############################
-- UPDATE Orders
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateOrder;
DELIMITER //
CREATE PROCEDURE sp_UpdateOrder(
    IN p_orderID INT,
    IN p_memberID INT,
    IN p_couponID INT,
    IN p_totalPrice DECIMAL(19,2)
)
BEGIN
    IF p_couponID = 0 THEN SET p_couponID = NULL; END IF;

    UPDATE Orders
    SET memberID = p_memberID, 
        couponID = p_couponID, 
        totalPrice = p_totalPrice
    WHERE orderID = p_orderID;
END //
DELIMITER ;

-- #############################
-- DELETE Orders
-- #############################
DROP PROCEDURE IF EXISTS sp_DeleteOrder;

DELIMITER //
CREATE PROCEDURE sp_DeleteOrder(IN p_orderID INT)
BEGIN
DECLARE error_message VARCHAR(255);

    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        DELETE FROM Orders WHERE orderID = p_orderID;

        IF ROW_COUNT() = 0 THEN
            SET error_message = CONCAT('No matching record found in Orders for orderID: ', p_orderID);
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_message;
        END IF;

    COMMIT;
END //
DELIMITER ;
