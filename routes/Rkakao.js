const express = require('express');
const router = express.Router();
const Ckakao = require('../controllers/Ckakao');

router.get('/login', Ckakao.login);
router.post('/exit', Ckakao.exit);

module.exports = router;
