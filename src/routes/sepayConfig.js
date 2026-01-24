const express = require('express');
const router = express.Router();
const sepayConfigController = require('../controller/sepayConfig.controller');

router.get('/', sepayConfigController.getConfig);
router.get('/shelf/:shelfId', sepayConfigController.getConfigByShelfId);
router.put('/', sepayConfigController.upsertConfig);

module.exports = router;