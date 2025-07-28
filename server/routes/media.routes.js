const express = require('express');

const router = express.Router();
const mediaController = require('../controllers/media.controller');

router.post('/upload-by-url', mediaController.uploadImageByUrl);

module.exports = router;
