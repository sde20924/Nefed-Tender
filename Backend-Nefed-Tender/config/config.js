const mysql = require("mysql2/promise");

// MySQL Database Configuration
const dbConfig = {
  host: 'earth.hostitbro.com',          
  user: "nafedtra_admin",      
  password: "Admin@2024",
  database: "nafedtra_tender_viexports", 
  port: 3306,
  connectionLimit: 20, // Maximum number of connections in the pool
    waitForConnections: true, // Wait for a connection to be available if all are in use
    connectTimeout: 10000, // Timeout for establishing a connection (10 seconds)
    acquireTimeout: 10000, // Timeout for acquiring a connection from the pool (10 seconds)                     
};


// Create a connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database");
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error("Error connecting to MySQL database", err);
  }
})();

// Export the pool for use in queries
module.exports = pool;
