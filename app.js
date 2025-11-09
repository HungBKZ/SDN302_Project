const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Import routes loader
const initRoutes = require('./loaders/routes');

dotenv.config();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(cors());

// Initialize all routes (menu, account, etc.)
initRoutes(app);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => {
        console.log("✅ MongoDB connected");
        const PORT = process.env.PORT || 1234;
        app.listen(PORT, () => {
            console.log(`🚀 Server running at: http://127.0.0.1:${PORT}`);
        });
    })
    .catch(err => console.error("❌ Could not connect to MongoDB:", err));

module.exports = app;
