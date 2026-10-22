const express = require('express');
const router = express.Router(); // міні-app, змонтований в app.js на /api/v1/auth

const { login, register } = require('../controllers/auth');

router.post('/login', login);
router.post('/register', register);

module.exports = router;
