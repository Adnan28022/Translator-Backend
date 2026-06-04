const express = require('express');
const router = express.Router();
const { translateText, getHistory, deleteHistoryItem } = require('../controllers/translatorController');
const auth = require('../middleware/auth'); // Jo pehle banaya tha

router.post('/translate', auth, translateText);
router.get('/history', auth, getHistory);
router.delete('/history/:id', auth, deleteHistoryItem);

module.exports = router;