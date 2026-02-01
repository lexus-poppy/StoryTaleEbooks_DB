// Get an instance of mysql we can use in the app
let mysql = require('mysql2')

// Create a 'connection pool' using the provided credentials
const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit   : 10,
    host              : 'classmysql.engr.oregonstate.edu',
    user              : 'cs340_bnrowner5',
    password          : 'wsY4jljgFoya',
    database          : 'cs340_browner5'
}).promise(); // This makes it so we can use async / await rather than callbacks

// Export it for use in our application
module.exports = pool;

// Citation for the following function:
// Date: 2/01/2026
// Copied from /OR/ Adapted from /OR/ Based on:
// Source URL: https://canvas.oregonstate.edu/courses/2031764/pages/exploration-overview-of-the-web-application-development-process?module_item_id=26243420