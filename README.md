# StoryTaleEbooks_DB

## Team members name 

Erika Brown 

Benjamin Smithynunta 

# Project title 

### Storytale eBooks Management System 

## Overview 

Storytale eBooks sells $ 5 million digital books annually. To track the sales and utilization of digital books, the database records the relationship between coupons and orders. Each order can utilize exactly one coupon. There can be multiple books per order. The current management system for Storytale eBooks is insufficient for the scale of its annual sales and transaction volume. A back-end database with their website would improve the reliability of day-to-day operations. 

 

## Database Outline 

### Members – 1:M 

Records of members of the website with their phone number and email. Each member can have many orders. 

members to orders 1:M 

- memberID (primary key, non-null, auto_incrementing, unique) INT (11) 

- firstName VARCHAR (45), non-null 

- lastName VARCHAR (45), non-null 

- phoneNumber VARCHAR (15) , default/expression is set to (123)-456-7890 non-null 

- email VARCHAR (50), non-null   

### Books – M:N 

Stores the individual books offered by the website in digital format.  

books to orders M:N 

- ISBN (primary key, non-null) VARCHAR (50) 

- title VARCHAR (50) non-null 

- author VARCHAR (50) non-null 

- publisher VARCHAR (50) 

- publishedDate DATE 

- genre VARCHAR (45) non-null 

### Coupons – 1:M 

Stores the coupons offered to current members for book orders.  

coupons to orders 1:M 

- couponID  (primary key, non-null, auto_incrementing, unique) INT (11) 

- couponDiscount DECIMAL (19,2) non-null 

- expiration_date DATE non-null 

### Orders – 1:M 

Stores the order of each member of the books purchased. Each member can have many orders. 1 coupon can be on many orders. 

members to orders 1:M 

books to orders M:N 

coupon to orders 1:M 

- orderID (primary key, non-null, auto_incrementing, unique) INT (11) 

- couponID (foreign key – coupons) 

- memberID (foreign key members) 

- totalPrice DECIMAL (19,2) non-null 

### BooksAndOrders – Intersection Table – M:1 

Many to Many relationships for storing the many books on many orders 

books to orders M:N 

- BooksAndOrdersID (primary key, non-null, auto_incrementing) INT (11) 

- ISBN (foreign key – books) 

- orderID (foreign key – orders) 

- QTY INT(11) 

- cost DECIMAL (19,2) 

- totalCost DECIMAL (19,2) 
