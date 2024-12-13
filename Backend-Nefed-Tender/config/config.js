const { Client } = require("pg");

const dbConfig = {
  user: "nafedtra_admin",
  password: "Admin@2024",
  host: "earth.hostitbro.com",
  port: "5432",
  database: "nafedtra_tenser_saas",
};

const connection = new Client(dbConfig);

connection.connect().then(() => {
    console.log("Connected to PostgreSQL database");
}).catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
});
module.exports = connection;
