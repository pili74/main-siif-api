// Importa express y los controladores
const express = require('express');
const router = express.Router();
const VersionController = require('../controladores/VersionController');


router.get('/version', VersionController.obtenerVersion);

// Exporta el router
module.exports = router;



