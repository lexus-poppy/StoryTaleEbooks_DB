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
    IN p_genre VARCHAR(45),
    IN p_bookCost DECIMAL(19,2)
)
BEGIN
    INSERT INTO Books (ISBN, title, author, publisher, publishedDate, genre, bookCost)
    VALUES (p_ISBN, p_title, p_author, p_publisher, p_publishedDate, p_genre, p_bookCost);

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
    IN p_genre VARCHAR(45),
    IN p_bookCost DECIMAL(19,2)
)
BEGIN
    UPDATE Books 
    SET title = p_title, 
        author = p_author, 
        publisher = p_publisher, 
        publishedDate = p_publishedDate, 
        genre = p_genre,
        bookCost = p_bookCost
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

-- Recalculation procedure to update totalPrice in Orders after changes in BooksAndOrders
DROP PROCEDURE IF EXISTS sp_RecalculateOrderTotal;
DELIMITER //

CREATE PROCEDURE sp_RecalculateOrderTotal(IN p_orderID INT)
BEGIN
    DECLARE discount DECIMAL(19,2) DEFAULT 0;

    -- Get coupon discount if applicable
    SELECT IFNULL(c.couponDiscount, 0)
    INTO discount
    FROM Orders o
    LEFT JOIN Coupons c ON o.couponID = c.couponID
    WHERE o.orderID = p_orderID;

    -- Compute subtotal (QTY × bookCost)
    UPDATE Orders
    SET totalPrice = GREATEST((
        SELECT IFNULL(SUM(bao.QTY * b.bookCost), 0)
        FROM BooksAndOrders bao
        JOIN Books b ON bao.ISBN = b.ISBN
        WHERE bao.orderID = p_orderID
    ) - discount, 0)     -- Never allow negative total
    WHERE orderID = p_orderID;
END //

DELIMITER ;

-- After inserting from BooksAndOrders, we need to recalculate the total price of the associated order.
DROP TRIGGER IF EXISTS trg_bao_after_insert;
DELIMITER //
CREATE TRIGGER trg_bao_after_insert
AFTER INSERT ON BooksAndOrders
FOR EACH ROW
BEGIN
    CALL sp_RecalculateOrderTotal(NEW.orderID);
END //
DELIMITER ;

-- After Update trigger to handle changes in QTY or ISBN (which could change bookCost)
DROP TRIGGER IF EXISTS trg_bao_after_update;
DELIMITER //
CREATE TRIGGER trg_bao_after_update
AFTER UPDATE ON BooksAndOrders
FOR EACH ROW
BEGIN
    CALL sp_RecalculateOrderTotal(NEW.orderID);
END //
DELIMITER ;

-- After Delete trigger to handle removal of items from an order
DROP TRIGGER IF EXISTS trg_bao_after_delete;
DELIMITER //
CREATE TRIGGER trg_bao_after_delete
AFTER DELETE ON BooksAndOrders
FOR EACH ROW
BEGIN
    CALL sp_RecalculateOrderTotal(OLD.orderID);
END //
DELIMITER ;

-- If an order's couponID is updated, we also need to recalculate the total price.
DROP TRIGGER IF EXISTS trg_orders_after_update;
DELIMITER //
CREATE TRIGGER trg_orders_after_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    CALL sp_RecalculateOrderTotal(NEW.orderID);
END //
DELIMITER ;

-- After updating a coupon's discount, we need to recalculate totals for all orders using that coupon.
DROP TRIGGER IF EXISTS trg_coupons_after_update;
DELIMITER //
CREATE TRIGGER trg_coupons_after_update
AFTER UPDATE ON Coupons
FOR EACH ROW
BEGIN
    UPDATE Orders
    SET totalPrice = totalPrice  -- Force a recalculation via trigger chain
    WHERE couponID = NEW.couponID;
END //
DELIMITER ;
