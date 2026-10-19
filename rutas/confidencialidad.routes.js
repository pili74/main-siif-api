const express = require('express');
const router = express.Router();

const confidencialidadController =
    require('../controladores/confidencialidad.controller');

/**
 * Rutas relacionadas con el acuerdo de confidencialidad
 * del Main SIIF.
 *
 * Esta ruta recibe el OPEID del usuario autenticado
 * y delega la verificación al controlador.
 */
router.post(
    '/verificar',
    confidencialidadController.verificarConfidencialidad
);

/**
 * Registra la aceptación del acuerdo de confidencialidad.
 *
 * Recibe el OPEID y el LOGIN del usuario autenticado
 * y delega el registro al controlador.
 */
router.post(
    '/aceptar',
    confidencialidadController.aceptarConfidencialidad
);

module.exports = router;