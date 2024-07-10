const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv=require('dotenv');

const app = express();

// Middleware
dotenv.config();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/url-history', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jqbdfdo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)

mongoose.connect(`mongodb+srv://swaggyhustler:kUMlU32mshLQBDIs@cluster0.jqbdfdo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model for history
const historySchema = new mongoose.Schema({
    url: String,
    timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);

// Routes
app.post('/api/history', async (req, res) => {
    const newHistory = new History({
        url: req.body.url
    });

    try {
        const savedHistory = await newHistory.save();
        res.json(savedHistory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await History.find().sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    try {
        const removedHistory = await History.findByIdAndDelete(req.params.id);
        res.json(removedHistory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/history/:id', async (req, res) => {
    try {
        const updatedHistory = await History.findByIdAndUpdate(
            req.params.id,
            { url: req.body.url },
            { new: true }
        );
        res.json(updatedHistory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
