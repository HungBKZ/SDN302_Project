const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const tableRouter = require('./modules/table/table.router');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());


app.use('/api/tables', tableRouter);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;