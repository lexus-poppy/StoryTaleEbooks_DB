SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Create TABLE members

CREATE TABLE IF NOT EXISTS Members (
  memberID INT(11) NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(45) NOT NULL,
  lastName VARCHAR(45) NOT NULL,
  phoneNumber VARCHAR(15) NOT NULL,
  email VARCHAR(50) NOT NULL,
  PRIMARY KEY (memberID));

-- CREATE TABLE books

CREATE TABLE IF NOT EXISTS Books (
  ISBN VARCHAR(50) NOT NULL,
  title VARCHAR(50) NOT NULL,
  author VARCHAR(50) NOT NULL,
  publisher VARCHAR(50) NULL,
  publishedDate DATE NULL,
  genre VARCHAR(45) NOT NULL,
  PRIMARY KEY (ISBN));

-- CREATE TABLE coupons

CREATE TABLE IF NOT EXISTS Coupons (
  couponID INT(11) NOT NULL AUTO_INCREMENT,
  couponDiscount DECIMAL(19,2) NOT NULL,
  expirationDate DATE NOT NULL,
  PRIMARY KEY (couponID));

-- CREATE TABLE orders

CREATE TABLE IF NOT EXISTS Orders (
  orderID INT(11) NOT NULL AUTO_INCREMENT,
  totalPrice DECIMAL(19,2) NOT NULL,
  couponID INT(11) NOT NULL,
  memberID INT(11) NOT NULL,
  PRIMARY KEY (orderID),
  CONSTRAINT fk_couponID
    FOREIGN KEY (couponID)
    REFERENCES coupons(couponID)
    ON DELETE CASCADE,
  CONSTRAINT fk_memberID
    FOREIGN KEY (memberID)
    REFERENCES members (memberID)
    ON DELETE CASCADE);

-- CREATE TABLE booksAndOrders

CREATE TABLE IF NOT EXISTS BooksAndOrders (
  booksAndOrdersID INT(11) NOT NULL AUTO_INCREMENT,
  ISBN VARCHAR(50) NOT NULL,
  orderID INT(11) NOT NULL,
  QTY INT(11) NOT NULL,
  PRIMARY KEY (booksAndOrdersID),
  CONSTRAINT fk_ISBN
    FOREIGN KEY (ISBN)
    REFERENCES books (ISBN)
    ON DELETE CASCADE,
  CONSTRAINT fk_orderID
    FOREIGN KEY (orderID)
    REFERENCES orders (orderID)
    ON DELETE CASCADE);

-- INSERT data into members TABLE

INSERT INTO Members (
      firstName,
      lastName,
      phoneNumber,
      email
    )
VALUES
    ('Alisha', 'Dickson', '971-239-9898', 'dickson.a@gmail.com'),
    ('Edward', 'Harrington', '503-827-2019', 'harrington.e@outlook.com'),
    ('Jamal', 'Malicena', '541-920-8201', 'jamal.malicena@hotmail.com'),
    ('Tamara', 'Fenrick', '503-201-2232', 'fenrick.tamara@proton.me');

-- INSERT data into books TABLE

INSERT INTO Books (
      ISBN,
      title,
      author,
      publisher,
      publishedDate,
      genre
    )
VALUES
    ('9780345384362', 'Intensity', 'Dean Koontz', 'Ballantine', '1996-01-01', 'Psychological Horror'),
    ('9780316569842', 'Delusional', 'James Patterson', 'Little, Brown and Company', '2026-05-21', 'Police Procedural'),
    ('9788284321318', 'Reminders of Him', 'Colleen Hoover', 'Montlake', '2022-01-18', 'Romance Novel'),
    ('9788501116536', 'The Silent Patient', 'Alex Michaelides', 'Celadon Books', '2019-02-05', 'Thriller'),
    ('9780316580571', 'Red Rabbit Ghost', 'Jen Julian', 'Orbit', '2025-07-22', 'Horror Fiction');
    
-- INSERT data into coupons TABLE

INSERT INTO Coupons (
      couponDiscount,
      expirationDate
    )
VALUES
    (
      '2.00', '2026-05-10'
    ),
    (
      '4.00', '2026-04-30' 
    ),
    (
      '6.00', '2026-04-15'
    ),
    (
      '4.00', '2026-03-14'
    );

-- INSERT data into orders TABLE

INSERT INTO Orders (
      totalPrice,
      couponID,
      memberID
    )
VALUES
    (
      '6.97', 1, 1
    ),
    (
      '11.98', 2, 2
    ),
    (
      '11.99', 3, 3
    ),
    (
      '22.78', 4, 4
    );

-- INSERT data into booksAndOrders TABLE
INSERT INTO BooksAndOrders (
      ISBN,
      orderID,
      QTY
    )
VALUES
    (
      '9780316580571', 1, 1
    ),
    (
      '9780345384362', 1, 2
    ),
    (
      '9788284321318', 2, 2
    ),
    (
      '9780316569842', 3, 1
    ),
    (
      '9788501116536', 4, 2
    );
SET FOREIGN_KEY_CHECKS=1;
COMMIT;
