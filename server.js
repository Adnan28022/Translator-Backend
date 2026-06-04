const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Routes Import
const authRoutes = require('./routes/authRoutes');
const translatorRoutes = require('./routes/translatorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. Middlewares
app.use(express.json()); // JSON data handle karne ke liye
app.use(cors()); // Frontend connection allow karne ke liye

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected...'))
    .catch(err => {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1); // Agar DB connect na ho to server band kar do
    });

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/translator', translatorRoutes);
app.use('/api/admin', adminRoutes);

// 4. Base Route for Health Check
app.get('/', (req, res) => {
    res.json({ message: "Translator API is running smoothly!" });
});

// 5. Global Error Handler (Optional but good)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Something went wrong on the server!' });
});

// 6. Port Selection
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});