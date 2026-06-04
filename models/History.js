const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalText: { type: String, required: true },
    translatedText: { type: String, required: true },
    fromLang: { type: String, default: 'en' },
    toLang: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);