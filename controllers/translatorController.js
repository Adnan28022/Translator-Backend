const History = require('../models/History');
const axios = require('axios');

// --- Translate Text & Save to History ---
exports.translateText = async (req, res) => {
    try {
        const { text, targetLang, sourceLang = 'en' } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({ msg: "Text and Target Language are required" });
        }

        // Free MyMemory API Call
        const response = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: {
                q: text,
                langpair: `${sourceLang}|${targetLang}`
            }
        });

        const translatedResult = response.data.responseData.translatedText;

        // Save to Database History
        const newHistory = new History({
            userId: req.user.id,
            originalText: text,
            translatedText: translatedResult,
            fromLang: sourceLang,
            toLang: targetLang
        });

        await newHistory.save();

        res.json(newHistory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Translation API Error" });
    }
};

// --- Get User History ---
exports.getHistory = async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// --- Delete Single History Item ---
exports.deleteHistoryItem = async (req, res) => {
    try {
        await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ msg: "History cleared" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};