const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes loader
const initRoutes = require("./loaders/routes");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Initialize routes
initRoutes(app);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running at: http://127.0.0.1:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error(err));
