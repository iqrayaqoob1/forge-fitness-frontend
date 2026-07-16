const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "forgefitness",
  password: "admin123",
  port: 5432,
});

app.post("/book", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await pool.query(
      "INSERT INTO bookings(name, email, message) VALUES($1, $2, $3)",
      [name, email, message],
    );

    res.json({
      success: true,
      message: "Booking saved successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database Error",
    });
  }
});
app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings ORDER BY id DESC");

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
